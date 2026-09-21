import { Order } from "@/lib/db/models/Order";
import { User } from "@/lib/db/models/User";
import { Address } from "@/lib/db/models/Address";
import {
  getOrderRevisionView,
  revisionRowChanged,
  type OrderItemSnapshot,
} from "@/lib/db/queries/adminOrders";

export type InvoiceRow = {
  itemNumber: number;
  original: OrderItemSnapshot | null;
  revised: OrderItemSnapshot;
};

export type InvoiceData = {
  orderId: number;
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  deliveryAddress: string | null;
  paymentMethod: string | null;
  paymentStatus: string;
  isRevised: boolean;
  // Every current item, in order — what the renderers use for a plain
  // (never-revised) invoice, where there's no original/revised split.
  rows: InvoiceRow[];
  // Only the items actually added, substituted, or quantity/price-changed
  // since the order was first placed — what the renderers use for the
  // revised invoice's Original-vs-Revised diff table. A never-touched item
  // has original === revised and has no place in a "what changed" table.
  changedRows: InvoiceRow[];
  originalSubtotal: number;
  originalGst: number;
  originalTotal: number;
  revisedSubtotal: number;
  revisedGst: number;
  revisedTotal: number;
  // positive = customer owes more, negative = refund owed to customer
  balanceAdjustment: number;
};

// Shared by the admin and customer invoice download routes, and consumed
// directly by both renderers (lib/pdf/orderInvoice.tsx,
// lib/excel/orderInvoice.ts) — the same numbers back the web view via
// getOrderRevisionView, so the two documents and the on-screen breakdown
// can never drift from each other.
export async function getOrderInvoiceData(orderId: number): Promise<InvoiceData | null> {
  const order = await Order.findByPk(orderId, { include: [{ model: User }] });
  if (!order) return null;

  const user = (order as Order & { User?: User }).User;
  const address = order.shippingAddressId
    ? await Address.findByPk(order.shippingAddressId)
    : null;
  const deliveryAddress = address
    ? [address.address, address.city, address.zipCode, address.country].filter(Boolean).join(", ")
    : null;

  const revision = await getOrderRevisionView(orderId);
  if (!revision) return null;

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    customerName: user?.businessName || user?.contactName || user?.email || "—",
    customerEmail: user?.email ?? null,
    customerPhone: user?.phone ?? null,
    deliveryAddress,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    isRevised: revision.isRevised,
    rows: revision.rows.map((r, i) => ({ itemNumber: i + 1, original: r.original, revised: r.revised })),
    changedRows: revision.rows
      .filter(revisionRowChanged)
      .map((r, i) => ({ itemNumber: i + 1, original: r.original, revised: r.revised })),
    originalSubtotal: revision.originalSubtotal,
    originalGst: revision.originalGst,
    originalTotal: revision.originalTotal,
    revisedSubtotal: revision.revisedSubtotal,
    revisedGst: revision.revisedGst,
    revisedTotal: revision.revisedTotal,
    balanceAdjustment: revision.balanceAdjustment,
  };
}
