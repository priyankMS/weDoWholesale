import { Op } from "sequelize";
import { Order, type OrderStatus } from "@/lib/db/models/Order";
import { OrderItem } from "@/lib/db/models/OrderItem";
import { User } from "@/lib/db/models/User";
import { OrderItemHistory } from "@/lib/db/models/OrderItemHistory";
import { sendEmail } from "@/lib/email/send";
import { orderWeightAdjustmentEmail } from "@/lib/email/templates/orderWeightAdjustment";

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

export type WeightAdjustmentSnapshot = {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

// Records the final delivered/cut weight for a variable-weight line item
// against what was ordered — the "estimated weight, settled at actual
// weight" pattern already flagged in the checkout copy. Deliberately does
// NOT touch OrderItem or Order-level totals (quantity/totalPrice/
// totalAmount/finalAmount) or trigger any Stripe charge/refund: "Ordered"
// must always read back as what the customer actually ordered, and the
// original invoice stays intact as a record of what was actually charged.
// This is purely the audit trail + customer notice an admin uses to settle
// the difference manually (extra charge, refund, or substitute item)
// through whichever channel fits the order's payment method.
// OrderItemHistory already existed for exactly this ("ordered vs.
// picked-up weight" per its own doc comment) but had never been wired to
// an admin action.
//
// Because the item itself is never mutated, the "before" baseline for
// this adjustment is read from the most recent prior OrderItemHistory
// entry for this item (if any) rather than from the item's own quantity —
// otherwise every adjustment (including an accidental re-save of the same
// value) would diff against the original ordered quantity forever,
// producing duplicate-looking history rows for what was really one
// ongoing correction. OrderItemHistory has no orderItemId column, so the
// lookup matches on orderId + productName, same as the customer-facing
// revision log already does.
export async function recordAdminWeightAdjustment(input: {
  orderId: number;
  orderItemId: number;
  actualQuantity: number;
  note?: string | null;
  // Lets an admin override the auto (actual - previous) * unitPrice figure
  // with a manually-typed dollar adjustment (e.g. a goodwill credit, or a
  // correction that isn't purely weight-driven). When omitted, the auto
  // calculation is used as before.
  manualAmount?: number | null;
}): Promise<{ adjustmentAmount: number }> {
  const item = await OrderItem.findOne({ where: { id: input.orderItemId, orderId: input.orderId } });
  if (!item) throw new Error("Order item not found");

  const unitPrice = Number(item.unitPrice);
  const productName = item.productName ?? `Item #${item.productId}`;

  const priorHistory = await OrderItemHistory.findOne({
    where: { orderId: input.orderId, productName, action: "updated" },
    order: [["createdAt", "DESC"]],
  });
  let before: WeightAdjustmentSnapshot = {
    quantity: Number(item.quantity),
    unitPrice,
    totalPrice: Number(item.totalPrice),
  };
  if (priorHistory?.snapshotAfter) {
    try {
      const prev = JSON.parse(priorHistory.snapshotAfter) as WeightAdjustmentSnapshot;
      before = { quantity: Number(prev.quantity), unitPrice, totalPrice: Number(prev.totalPrice) };
    } catch {
      // fall back to the item's original quantity/totalPrice above
    }
  }

  const hasManualAmount =
    input.manualAmount !== null && input.manualAmount !== undefined && !Number.isNaN(input.manualAmount);
  const adjustmentAmount = hasManualAmount
    ? Number(input.manualAmount!.toFixed(2))
    : Number(((input.actualQuantity - before.quantity) * unitPrice).toFixed(2));
  const after: WeightAdjustmentSnapshot = {
    quantity: input.actualQuantity,
    unitPrice,
    totalPrice: Number((before.totalPrice + adjustmentAmount).toFixed(2)),
  };

  await OrderItemHistory.create({
    orderId: input.orderId,
    action: "updated",
    productName,
    sku: item.sku,
    snapshotBefore: JSON.stringify({ ...before, note: input.note ?? null }),
    snapshotAfter: JSON.stringify(after),
  });

  const order = await Order.findByPk(input.orderId, {
    include: [{ model: User, attributes: ["businessName", "contactName", "email"] }],
  });
  const user = (order as (Order & { User?: User }) | null)?.User;
  if (order && user?.email) {
    const { subject, html, text } = orderWeightAdjustmentEmail({
      contactName: user.businessName || user.contactName || "there",
      orderNumber: order.orderNumber,
      itemLabel: item.productName ?? "Item",
      orderedQty: before.quantity,
      actualQty: after.quantity,
      unit: "kg",
      unitPrice,
      adjustmentAmount,
      note: input.note ?? null,
    });
    await sendEmail({ to: user.email, subject, html, text });
  }

  return { adjustmentAmount };
}
