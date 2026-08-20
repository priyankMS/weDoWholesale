import { Order } from "@/lib/db/models/Order";
import { OrderItem } from "@/lib/db/models/OrderItem";
import { orderStatusMeta, formatDate, formatMoney, type OrderStatus } from "@/lib/format";

// Screen 30's order lookup card (Support & FAQ). Kept in its own query
// module rather than lib/db/queries/orders.ts — that file's checkout flow
// is intentionally out of scope for this phase.
export type SupportOrderLookupResult = {
  orderNumber: string;
  statusLabel: string;
  createdAt: string;
  totalKg: number;
  finalAmount: string;
};

export async function lookupOrderForSupport(
  userId: number,
  rawOrderNumber: string,
): Promise<SupportOrderLookupResult | null> {
  const cleaned = rawOrderNumber.trim().replace(/^#/, "").toUpperCase();
  if (!cleaned) return null;

  const orderNumber = cleaned.startsWith("WDH-") ? cleaned : `WDH-${cleaned}`;

  const order = await Order.findOne({
    where: { userId, orderNumber },
    include: [{ model: OrderItem, attributes: ["quantity"] }],
  });
  if (!order) return null;

  const items = (order.get("OrderItems") as OrderItem[] | undefined) ?? [];
  // Most wholesale line items are priced per kg — summing quantity gives a
  // reasonable approximation of the order's total weight for the lookup
  // card, same as the mockup's "100 kg" summary line.
  const totalKg = items.reduce((sum, i) => sum + Number(i.quantity), 0);

  return {
    orderNumber: order.orderNumber,
    statusLabel: orderStatusMeta(order.orderStatus as OrderStatus | null).label,
    createdAt: formatDate(order.createdAt),
    totalKg,
    finalAmount: formatMoney(Number(order.finalAmount)),
  };
}
