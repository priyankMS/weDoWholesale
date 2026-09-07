import { Op, type Transaction } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Order, type OrderStatus } from "@/lib/db/models/Order";
import { OrderItem } from "@/lib/db/models/OrderItem";
import { User } from "@/lib/db/models/User";
import { Address } from "@/lib/db/models/Address";
import { OrderItemHistory } from "@/lib/db/models/OrderItemHistory";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { bestVariantPrice, unitFor } from "@/lib/db/queries/catalogue";
import { getPlatformSettings } from "@/lib/db/queries/settings";
import { variantLabel } from "@/lib/format";
import { enqueueEmail } from "@/lib/queue/emailQueue";
import { orderRevisedEmail } from "@/lib/email/templates/orderRevised";
import { orderDispatchedEmail } from "@/lib/email/templates/orderDispatched";

export type AdminOrderRow = {
  id: number;
  orderNumber: string;
  customerName: string;
  itemCount: number;
  finalAmount: number;
  orderStatus: OrderStatus | null;
  deliveryDate: string | null;
  createdAt: Date;
  paymentMethod: string | null;
  paymentStatus: string;
  paidAt: Date | null;
};

export type AdminOrderListParams = {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
};

export type AdminOrderListResult = {
  orders: AdminOrderRow[];
  total: number;
  page: number;
  pageSize: number;
};

const ACTIVE_STATUSES: OrderStatus[] = ["pending", "new", "shipped"];
const COD_SURCHARGE_RATE = 0.02;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function listAdminOrders(params: AdminOrderListParams): Promise<AdminOrderListResult> {
  const { status, page = 1, pageSize = 20 } = params;

  const where: Record<string | symbol, unknown> = {};
  if (status) where.orderStatus = status;

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [{ model: User, attributes: ["id", "businessName", "contactName", "email"] }],
    order: [["createdAt", "DESC"]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    distinct: true,
  });

  const orderIds = rows.map((o) => o.id);
  const itemCounts = orderIds.length
    ? await OrderItem.findAll({
        attributes: ["orderId"],
        where: { orderId: { [Op.in]: orderIds } },
      })
    : [];
  const countByOrder = new Map<number, number>();
  for (const item of itemCounts) {
    countByOrder.set(item.orderId, (countByOrder.get(item.orderId) ?? 0) + 1);
  }

  const orders: AdminOrderRow[] = rows.map((o) => {
    const user = (o as Order & { User?: User }).User;
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: user?.businessName || user?.contactName || user?.email || "—",
      itemCount: countByOrder.get(o.id) ?? 0,
      finalAmount: Number(o.finalAmount),
      orderStatus: o.orderStatus ?? null,
      deliveryDate: o.deliveryDate,
      createdAt: o.createdAt,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      paidAt: o.paidAt,
    };
  });

  return { orders, total: count, page, pageSize };
}

export async function getLiveOrderCount(): Promise<number> {
  return Order.count({ where: { orderStatus: { [Op.in]: ACTIVE_STATUSES } } });
}

export async function getAdminOrderDetail(id: number) {
  const order = await Order.findByPk(id, {
    include: [
      { model: User, attributes: ["id", "businessName", "contactName", "email", "phone"] },
      { model: OrderItem },
    ],
  });
  return order;
}

// ── Revision engine ──
//
// Unlike the audit-only weight-adjustment feature this replaces, every
// mutation here actually updates the order's live total/GST/final amount
// (via recomputeOrderTotals) — Stripe charge/refund stays a manual step for
// the admin, same as before. All writes go through Order.findByPk/.update()
// and OrderItem create/update scoped to the given orderId — never
// Order.create — so a revision always changes the existing order, never a
// new one.

export type OrderItemSnapshot = {
  productId: number;
  variantId: number | null;
  sku: string | null;
  productName: string;
  category: string | null;
  conditionType: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
};

function snapshotOf(item: OrderItem): OrderItemSnapshot {
  return {
    productId: item.productId,
    variantId: item.variantId,
    sku: item.sku,
    productName: item.productName ?? `Item #${item.productId}`,
    category: item.category,
    conditionType: item.conditionType,
    quantity: Number(item.quantity),
    unit: item.unit || "kg",
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
  };
}

// Recalculates subtotal/GST/COD-surcharge/final from the order's live
// OrderItem rows (same formula createOrder uses in orders.ts) and snapshots
// the pre-revision totals onto original_*  the first time this ever runs
// for the order — so "Original" stays available for the invoice even after
// the live columns become the revised numbers. Shipping fee is left
// untouched: no signal that item edits should change delivery pricing.
async function recomputeOrderTotals(orderId: number, t: Transaction): Promise<void> {
  const order = await Order.findByPk(orderId, { transaction: t });
  if (!order) throw new Error("Order not found");
  const items = await OrderItem.findAll({ where: { orderId }, transaction: t });

  const subtotal = round2(items.reduce((sum, i) => sum + Number(i.totalPrice), 0));
  const settings = await getPlatformSettings();
  const gstAmount = round2(subtotal * (settings.gstRatePercent / 100));
  const codCharges =
    order.paymentOption === "cod" ? round2((subtotal + gstAmount) * COD_SURCHARGE_RATE) : 0;
  const shippingFee = Number(order.shippingFee ?? 0);
  const finalAmount = round2(subtotal + gstAmount + codCharges + shippingFee);

  const isFirstRevision = order.originalFinalAmount == null;
  await order.update(
    {
      totalAmount: subtotal,
      gstAmount,
      codCharges,
      finalAmount,
      ...(isFirstRevision
        ? {
            originalTotalAmount: order.totalAmount,
            originalGstAmount: order.gstAmount,
            originalFinalAmount: order.finalAmount,
          }
        : {}),
    },
    { transaction: t },
  );
}

async function notifyOrderRevised(orderId: number, changeSummary: string): Promise<void> {
  const order = await Order.findByPk(orderId, { include: [{ model: User }] });
  const user = (order as (Order & { User?: User }) | null)?.User;
  if (!order || !user?.email) return;
  const { subject, html, text } = orderRevisedEmail({
    contactName: user.businessName || user.contactName || "there",
    orderNumber: order.orderNumber,
    changeSummary,
    revisedTotal: Number(order.finalAmount),
    balanceAdjustment: round2(Number(order.finalAmount) - Number(order.originalFinalAmount ?? order.finalAmount)),
  });
  await enqueueEmail({ to: user.email, subject, html, text });
}

// Fired from the admin order-status PATCH route the moment orderStatus
// flips to "shipped". There's no driver-assignment feature/model yet, so
// this uses the general dispatch contact — swap in real driver details
// once that feature exists rather than adding a placeholder DB column
// speculatively.
export async function notifyOrderDispatched(orderId: number): Promise<void> {
  const order = await Order.findByPk(orderId, { include: [{ model: User }, { model: OrderItem }] });
  const user = (order as (Order & { User?: User }) | null)?.User;
  if (!order || !user?.email) return;

  const items = (order.get("OrderItems") as OrderItem[] | undefined) ?? [];
  const totalWeightKg = round2(items.reduce((sum, i) => sum + Number(i.quantity), 0));
  const itemSummary = items.map((i) => i.productName ?? `Item #${i.productId}`).join(", ") || "—";

  const address = order.shippingAddressId ? await Address.findByPk(order.shippingAddressId) : null;
  const deliveryAddress =
    order.shippingType === "pickup"
      ? "Pickup at our warehouse"
      : (address
          ? [address.address, address.city, address.zipCode, address.country].filter(Boolean).join(", ")
          : "your delivery address");

  const { subject, html, text } = orderDispatchedEmail({
    contactName: user.businessName || user.contactName || "there",
    orderNumber: order.orderNumber,
    driverName: "Our delivery team",
    driverPhone: "+1 (780) 722-7623",
    windowLabel: order.timeSlot || "your scheduled window",
    deliveryAddress,
    total: Number(order.finalAmount),
    itemSummary,
    totalWeightKg,
  });
  await enqueueEmail({ to: user.email, subject, html, text });
}

async function loadPricedVariant(productId: number, variantId: number) {
  const variant = await WdhVariant.findOne({
    where: { id: variantId, productId },
    include: [{ model: WdhProduct }, { model: WdhVariantPricing, as: "pricing" }],
  });
  if (!variant) throw new Error("Product variant not found");
  const product = (variant as WdhVariant & { WdhProduct?: WdhProduct }).WdhProduct;
  const price = bestVariantPrice(variant, variant.pricing ?? []);
  if (price == null) throw new Error("This item has no price and can't be used");
  const label = variantLabel(variant);
  const productName = product
    ? label && label !== "Standard"
      ? `${product.item} (${label})`
      : product.item
    : `Item #${variant.id}`;
  return {
    productId: variant.productId,
    variantId: variant.id,
    sku: variant.sku,
    productName,
    category: product?.category ?? null,
    conditionType: variant.conditionType ?? null,
    unit: unitFor(product?.category ?? "", variant.per ?? null),
    unitPrice: price,
  };
}

export async function addOrderItem(input: {
  orderId: number;
  productId: number;
  variantId: number;
  quantity: number;
  note?: string | null;
}): Promise<void> {
  const priced = await loadPricedVariant(input.productId, input.variantId);
  const totalPrice = round2(priced.unitPrice * input.quantity);

  await sequelize.transaction(async (t) => {
    const order = await Order.findByPk(input.orderId, { transaction: t });
    if (!order) throw new Error("Order not found");

    const created = await OrderItem.create(
      {
        orderId: input.orderId,
        productId: priced.productId,
        variantId: priced.variantId,
        sku: priced.sku,
        productName: priced.productName,
        category: priced.category,
        conditionType: priced.conditionType,
        quantity: input.quantity,
        unit: priced.unit,
        unitPrice: priced.unitPrice,
        totalPrice,
      },
      { transaction: t },
    );

    await OrderItemHistory.create(
      {
        orderId: input.orderId,
        orderItemId: created.id,
        action: "added",
        productName: priced.productName,
        sku: priced.sku,
        snapshotBefore: null,
        snapshotAfter: JSON.stringify({
          ...priced,
          quantity: input.quantity,
          totalPrice,
          note: input.note ?? null,
        }),
      },
      { transaction: t },
    );

    await recomputeOrderTotals(input.orderId, t);
  });

  await notifyOrderRevised(input.orderId, `${priced.productName} added to your order`);
}

export async function updateOrderItem(input: {
  orderId: number;
  orderItemId: number;
  productId?: number;
  variantId?: number;
  quantity: number;
  // Manual override — e.g. the actual weighed amount justifies a different
  // per-unit price than the catalog's. Takes priority over a substitution's
  // freshly-priced variant, since typing a price is a deliberate admin
  // decision the substitution lookup shouldn't silently clobber.
  unitPrice?: number;
  note?: string | null;
}): Promise<void> {
  let changeSummary = "";

  await sequelize.transaction(async (t) => {
    const item = await OrderItem.findOne({
      where: { id: input.orderItemId, orderId: input.orderId },
      transaction: t,
    });
    if (!item) throw new Error("Order item not found");

    const before = snapshotOf(item);
    const isSubstitution =
      input.variantId != null &&
      (input.variantId !== item.variantId || input.productId !== item.productId);

    let productId = item.productId;
    let variantId = item.variantId;
    let sku = item.sku;
    let productName = item.productName ?? before.productName;
    let category = item.category;
    let conditionType = item.conditionType;
    let unit = item.unit || "kg";
    let unitPrice = Number(item.unitPrice);

    if (isSubstitution && input.productId != null && input.variantId != null) {
      const priced = await loadPricedVariant(input.productId, input.variantId);
      productId = priced.productId;
      variantId = priced.variantId;
      sku = priced.sku;
      productName = priced.productName;
      category = priced.category;
      conditionType = priced.conditionType;
      unit = priced.unit;
      unitPrice = priced.unitPrice;
    }

    if (input.unitPrice != null) unitPrice = input.unitPrice;

    const quantity = input.quantity;
    const totalPrice = round2(unitPrice * quantity);

    await item.update(
      { productId, variantId, sku, productName, category, conditionType, unit, quantity, unitPrice, totalPrice },
      { transaction: t },
    );

    const after: OrderItemSnapshot = {
      productId,
      variantId,
      sku,
      productName,
      category,
      conditionType,
      quantity,
      unit,
      unitPrice,
      totalPrice,
    };

    await OrderItemHistory.create(
      {
        orderId: input.orderId,
        orderItemId: item.id,
        action: "updated",
        productName: after.productName,
        sku: after.sku,
        snapshotBefore: JSON.stringify({ ...before, note: input.note ?? null }),
        snapshotAfter: JSON.stringify(after),
      },
      { transaction: t },
    );

    await recomputeOrderTotals(input.orderId, t);

    changeSummary = isSubstitution
      ? `${before.productName} substituted with ${after.productName}`
      : quantity === 0
        ? `${after.productName} removed from your order`
        : input.unitPrice != null
          ? `${after.productName} quantity updated to ${quantity} ${unit} at an adjusted price of $${unitPrice.toFixed(2)}/${unit}`
          : `${after.productName} quantity updated to ${quantity} ${unit}`;
  });

  await notifyOrderRevised(input.orderId, changeSummary);
}

export type OrderRevisionRow = {
  orderItemId: number;
  original: OrderItemSnapshot | null;
  revised: OrderItemSnapshot;
};

// True only when a row is worth surfacing as "changed" (newly added, or
// original differs from revised) — a never-touched item now carries
// original === revised (see getOrderRevisionView below), so callers that
// only want the delta (e.g. the customer account page) must filter with
// this rather than just checking `original != null`.
export function revisionRowChanged(row: OrderRevisionRow): boolean {
  if (!row.original) return true;
  return (
    row.original.productName !== row.revised.productName ||
    row.original.quantity !== row.revised.quantity ||
    Math.abs(row.original.totalPrice - row.revised.totalPrice) >= 0.005
  );
}

export type OrderRevisionView = {
  isRevised: boolean;
  rows: OrderRevisionRow[];
  originalSubtotal: number;
  originalGst: number;
  originalTotal: number;
  revisedSubtotal: number;
  revisedGst: number;
  revisedTotal: number;
  // positive = customer owes more, negative = refund owed to customer —
  // same sign convention as the retired weight-adjustment feature.
  balanceAdjustment: number;
};

// Single source of truth for the admin page, the customer page, and both
// invoice renderers (lib/pdf/orderInvoice.tsx, lib/excel/orderInvoice.ts).
export async function getOrderRevisionView(orderId: number): Promise<OrderRevisionView | null> {
  const order = await Order.findByPk(orderId);
  if (!order) return null;

  const items = await OrderItem.findAll({ where: { orderId }, order: [["id", "ASC"]] });
  // Fetch every history action (not just "updated") — an item's presence
  // in "added" is what marks it as genuinely new; absence from history
  // entirely means "never touched", which must show original === revised,
  // not a blank Original (that blank is reserved for real additions).
  const historyRows = await OrderItemHistory.findAll({
    where: { orderId },
    order: [["createdAt", "ASC"]],
  });

  const addedItemIds = new Set<number>();
  const earliestBeforeByItemId = new Map<number, string>();
  for (const h of historyRows) {
    if (h.orderItemId == null) continue;
    if (h.action === "added") addedItemIds.add(h.orderItemId);
    if (h.action === "updated" && h.snapshotBefore && !earliestBeforeByItemId.has(h.orderItemId)) {
      earliestBeforeByItemId.set(h.orderItemId, h.snapshotBefore);
    }
  }

  const rows: OrderRevisionRow[] = items.map((item) => {
    const revised = snapshotOf(item);

    if (addedItemIds.has(item.id)) {
      return { orderItemId: item.id, original: null, revised };
    }

    const rawBefore = earliestBeforeByItemId.get(item.id);
    if (!rawBefore) {
      // Never touched — original and revised are the same thing.
      return { orderItemId: item.id, original: revised, revised };
    }
    try {
      const parsed = JSON.parse(rawBefore) as Partial<OrderItemSnapshot>;
      const original: OrderItemSnapshot = {
        productId: parsed.productId ?? revised.productId,
        variantId: parsed.variantId ?? null,
        sku: parsed.sku ?? null,
        productName: parsed.productName ?? revised.productName,
        category: parsed.category ?? null,
        conditionType: parsed.conditionType ?? null,
        quantity: Number(parsed.quantity ?? 0),
        unit: parsed.unit || "kg",
        unitPrice: Number(parsed.unitPrice ?? 0),
        totalPrice: Number(parsed.totalPrice ?? 0),
      };
      return { orderItemId: item.id, original, revised };
    } catch {
      return { orderItemId: item.id, original: revised, revised };
    }
  });

  const revisedSubtotal = Number(order.totalAmount);
  const revisedGst = Number(order.gstAmount ?? 0);
  const revisedTotal = Number(order.finalAmount);
  const isRevised = order.originalFinalAmount != null;
  const originalSubtotal = isRevised ? Number(order.originalTotalAmount) : revisedSubtotal;
  const originalGst = isRevised ? Number(order.originalGstAmount) : revisedGst;
  const originalTotal = isRevised ? Number(order.originalFinalAmount) : revisedTotal;

  return {
    isRevised,
    rows,
    originalSubtotal,
    originalGst,
    originalTotal,
    revisedSubtotal,
    revisedGst,
    revisedTotal,
    balanceAdjustment: round2(revisedTotal - originalTotal),
  };
}
