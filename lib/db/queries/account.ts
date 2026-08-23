import { Op } from "sequelize";
import { Order } from "@/lib/db/models/Order";
import { OrderItem } from "@/lib/db/models/OrderItem";
import { OrderItemHistory } from "@/lib/db/models/OrderItemHistory";
import { User } from "@/lib/db/models/User";
import { Address } from "@/lib/db/models/Address";
import { NotificationPreference } from "@/lib/db/models/NotificationPreference";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { bestVariantPrice, unitFor } from "@/lib/db/queries/catalogue";
import { variantLabel, type OrderStatus } from "@/lib/format";

const ACTIVE_STATUSES = ["pending", "new", "shipped"] as const;
const TERMS_PAYMENT_OPTIONS = ["invoice", "net_terms"] as const;

function invoiceNumberFor(orderNumber: string): string {
  return orderNumber.replace(/^WDH-/, "INV-");
}

// ── Dashboard ──

export type AccountOverview = {
  totalOrders: number;
  activeOrders: number;
  lifetimeSpend: number;
  paymentTerms: "cod" | "net15" | "net30" | null;
  savedAddressCount: number;
};

export async function getAccountOverview(userId: number): Promise<AccountOverview> {
  const [orders, user, addressCount] = await Promise.all([
    Order.findAll({ where: { userId }, attributes: ["finalAmount", "orderStatus"] }),
    User.findByPk(userId, { attributes: ["paymentTerms"] }),
    Address.count({ where: { userId } }),
  ]);

  const fulfilled = orders.filter(
    (o) => o.orderStatus !== "cancelled" && o.orderStatus !== "returned",
  );
  const lifetimeSpend = fulfilled.reduce((sum, o) => sum + Number(o.finalAmount), 0);
  const activeOrders = orders.filter((o) =>
    (ACTIVE_STATUSES as readonly (string | null)[]).includes(o.orderStatus),
  ).length;

  return {
    totalOrders: orders.length,
    activeOrders,
    lifetimeSpend,
    paymentTerms: user?.paymentTerms ?? null,
    savedAddressCount: addressCount,
  };
}

// ── Order history ──

export type OrderHistoryRow = {
  orderNumber: string;
  createdAt: Date;
  itemCount: number;
  finalAmount: number;
  orderStatus: OrderStatus | null;
};

export async function getOrderHistory(userId: number): Promise<OrderHistoryRow[]> {
  const orders = await Order.findAll({
    where: { userId },
    include: [{ model: OrderItem, attributes: ["id"] }],
    order: [["createdAt", "DESC"]],
  });

  return orders.map((o) => ({
    orderNumber: o.orderNumber,
    createdAt: o.createdAt,
    itemCount: (o.get("OrderItems") as OrderItem[] | undefined)?.length ?? 0,
    finalAmount: Number(o.finalAmount),
    orderStatus: o.orderStatus,
  }));
}

// ── Order detail ──

export type OrderDetailItem = {
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type RevisionEntry = {
  action: string;
  productName: string;
  sku: string | null;
  createdAt: Date;
};

export type OrderDetail = {
  orderNumber: string;
  createdAt: Date;
  updatedAt: Date;
  orderStatus: OrderStatus | null;
  paymentMethod: string | null;
  paymentStatus: string;
  paymentOption: string | null;
  totalAmount: number;
  gstAmount: number;
  shippingFee: number;
  codCharges: number;
  finalAmount: number;
  deliveryDate: string | null;
  timeSlot: string | null;
  receiptUrl: string | null;
  paidAt: Date | null;
  cardBrand: string | null;
  cardLast4: string | null;
  items: OrderDetailItem[];
  revisions: RevisionEntry[];
};

export async function getOrderDetail(
  userId: number,
  orderNumber: string,
): Promise<OrderDetail | null> {
  const order = await Order.findOne({
    where: { userId, orderNumber },
    include: [{ model: OrderItem }],
  });
  if (!order) return null;

  const revisionRows = await OrderItemHistory.findAll({
    where: { orderId: order.id },
    order: [["createdAt", "ASC"]],
  });

  const items = (order.get("OrderItems") as OrderItem[] | undefined) ?? [];

  return {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paymentOption: order.paymentOption,
    totalAmount: Number(order.totalAmount),
    gstAmount: Number(order.gstAmount ?? 0),
    shippingFee: Number(order.shippingFee ?? 0),
    codCharges: Number(order.codCharges),
    finalAmount: Number(order.finalAmount),
    deliveryDate: order.deliveryDate,
    timeSlot: order.timeSlot,
    receiptUrl: order.receiptUrl,
    paidAt: order.paidAt,
    cardBrand: order.cardBrand,
    cardLast4: order.cardLast4,
    items: items.map((i) => ({
      productName: i.productName ?? `Item #${i.productId}`,
      sku: i.sku,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
    })),
    revisions: revisionRows.map((r) => ({
      action: r.action,
      productName: r.productName,
      sku: r.sku ?? null,
      createdAt: r.createdAt,
    })),
  };
}

// ── Quick reorder ──

export type ReorderCandidate = {
  orderNumber: string;
  createdAt: Date;
  finalAmount: number;
  orderStatus: OrderStatus | null;
  items: { productName: string; quantity: number }[];
};

export async function getReorderCandidates(
  userId: number,
  limit = 5,
): Promise<ReorderCandidate[]> {
  const orders = await Order.findAll({
    where: { userId, orderStatus: { [Op.notIn]: ["cancelled", "returned"] } },
    include: [{ model: OrderItem }],
    order: [["createdAt", "DESC"]],
    limit,
  });

  return orders.map((o) => ({
    orderNumber: o.orderNumber,
    createdAt: o.createdAt,
    finalAmount: Number(o.finalAmount),
    orderStatus: o.orderStatus,
    items: ((o.get("OrderItems") as OrderItem[] | undefined) ?? []).map((i) => ({
      productName: i.productName ?? `Item #${i.productId}`,
      quantity: Number(i.quantity),
    })),
  }));
}

export type ReorderCartItem = {
  productId: number;
  variantId: number;
  name: string;
  category: string;
  unit: string;
  image: string | null;
  price: number;
  supplierName: string | null;
  qty: number;
};

export type ReorderResult = {
  items: ReorderCartItem[];
  unavailable: string[];
};

// Re-derives cart-ready items (current price/image/etc.) for every line in
// a past order, rather than trusting the order's saved unit_price — the
// same "never trust stale prices" rule createOrder() follows.
export async function getReorderCartItems(
  userId: number,
  orderNumber: string,
): Promise<ReorderResult | null> {
  const order = await Order.findOne({
    where: { userId, orderNumber },
    include: [{ model: OrderItem }],
  });
  if (!order) return null;

  const orderItems = (order.get("OrderItems") as OrderItem[] | undefined) ?? [];
  const variantIds = orderItems.map((i) => i.variantId).filter((v): v is number => v != null);

  const variants = await WdhVariant.findAll({
    where: { id: variantIds },
    include: [
      { model: WdhProduct },
      { model: WdhVariantPricing, as: "pricing", include: [{ model: WdhSupplier }] },
    ],
  });
  const variantById = new Map(variants.map((v) => [v.id, v]));

  const items: ReorderCartItem[] = [];
  const unavailable: string[] = [];

  for (const oi of orderItems) {
    const variant = oi.variantId != null ? variantById.get(oi.variantId) : undefined;
    const product = (variant as (WdhVariant & { WdhProduct?: WdhProduct }) | undefined)
      ?.WdhProduct;
    const price = variant ? bestVariantPrice(variant, variant.pricing ?? []) : null;

    if (!variant || !product || price == null) {
      unavailable.push(oi.productName ?? `Item #${oi.productId}`);
      continue;
    }

    const label = variantLabel(variant);
    const name = label && label !== "Standard" ? `${product.item} (${label})` : product.item;
    const pricingWithSupplier = (variant.pricing ?? []) as (WdhVariantPricing & {
      WdhSupplier?: WdhSupplier;
    })[];
    const supplierName =
      pricingWithSupplier.find((p) => p.WdhSupplier)?.WdhSupplier?.name ?? null;

    items.push({
      productId: product.id,
      variantId: variant.id,
      name,
      category: product.category ?? "",
      unit: unitFor(product.category ?? "", variant.per ?? null),
      image: variant.image1 || variant.thumbnail || product.thumbnail || null,
      price,
      supplierName,
      qty: Number(oi.quantity),
    });
  }

  return { items, unavailable };
}

// ── Invoices and statements ──

export type InvoiceRow = {
  invoiceNumber: string;
  orderNumber: string;
  createdAt: Date;
  amount: number;
  paid: boolean;
  dueDate: Date;
};

export type MonthlyStatement = {
  month: string;
  year: number;
  orderCount: number;
  total: number;
};

export type InvoiceSummary = {
  invoices: InvoiceRow[];
  statements: MonthlyStatement[];
  outstandingBalance: number;
  nextDue: InvoiceRow | null;
};

function dueDateFor(createdAt: Date, terms: "cod" | "net15" | "net30" | null): Date {
  const days = terms === "net30" ? 30 : 15;
  const due = new Date(createdAt);
  due.setDate(due.getDate() + days);
  return due;
}

export async function getInvoiceSummary(userId: number): Promise<InvoiceSummary> {
  const [orders, user] = await Promise.all([
    Order.findAll({
      where: { userId, orderStatus: { [Op.notIn]: ["cancelled", "returned"] } },
      order: [["createdAt", "DESC"]],
    }),
    User.findByPk(userId, { attributes: ["paymentTerms"] }),
  ]);

  const termsOrders = orders.filter((o) =>
    (TERMS_PAYMENT_OPTIONS as readonly (string | null)[]).includes(o.paymentOption),
  );

  const invoices: InvoiceRow[] = termsOrders.map((o) => ({
    invoiceNumber: invoiceNumberFor(o.orderNumber),
    orderNumber: o.orderNumber,
    createdAt: o.createdAt,
    amount: Number(o.finalAmount),
    paid: o.paymentStatus === "Completed",
    dueDate: dueDateFor(o.createdAt, user?.paymentTerms ?? null),
  }));

  const unpaid = invoices.filter((i) => !i.paid);
  const outstandingBalance = unpaid.reduce((sum, i) => sum + i.amount, 0);
  const nextDue =
    unpaid.length > 0
      ? unpaid.reduce((a, b) => (a.dueDate < b.dueDate ? a : b))
      : null;

  const byMonth = new Map<string, { month: string; year: number; count: number; total: number }>();
  for (const o of orders) {
    const key = `${o.createdAt.getFullYear()}-${o.createdAt.getMonth()}`;
    const existing = byMonth.get(key);
    const monthLabel = o.createdAt.toLocaleDateString("en-CA", { month: "long" });
    if (existing) {
      existing.count += 1;
      existing.total += Number(o.finalAmount);
    } else {
      byMonth.set(key, {
        month: monthLabel,
        year: o.createdAt.getFullYear(),
        count: 1,
        total: Number(o.finalAmount),
      });
    }
  }
  const statements: MonthlyStatement[] = Array.from(byMonth.values()).map((v) => ({
    month: v.month,
    year: v.year,
    orderCount: v.count,
    total: v.total,
  }));

  return { invoices, statements, outstandingBalance, nextDue };
}

// ── Payment methods & terms ──

export type PaymentSummary = {
  paymentTerms: "cod" | "net15" | "net30" | null;
  creditLimit: number | null;
  outstandingBalance: number;
  nextDue: InvoiceRow | null;
};

export async function getPaymentSummary(userId: number): Promise<PaymentSummary> {
  const [user, invoiceSummary] = await Promise.all([
    User.findByPk(userId, { attributes: ["paymentTerms", "creditLimit"] }),
    getInvoiceSummary(userId),
  ]);

  return {
    paymentTerms: user?.paymentTerms ?? null,
    creditLimit: user?.creditLimit != null ? Number(user.creditLimit) : null,
    outstandingBalance: invoiceSummary.outstandingBalance,
    nextDue: invoiceSummary.nextDue,
  };
}

// ── Notification preferences ──

export async function getNotificationPreferences(
  userId: number,
): Promise<NotificationPreference> {
  const [prefs] = await NotificationPreference.findOrCreate({
    where: { userId },
    defaults: { userId },
  });
  return prefs;
}
