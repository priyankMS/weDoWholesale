import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminOrderDetail } from "@/lib/db/queries/adminOrders";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { WeightAdjustmentTable } from "@/components/admin/WeightAdjustmentTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { User } from "@/lib/db/models/User";
import { OrderItem } from "@/lib/db/models/OrderItem";
import { OrderItemHistory } from "@/lib/db/models/OrderItemHistory";

type WeightSnapshot = { quantity: number; unitPrice: number; totalPrice: number; note?: string | null };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderDetail(Number(id));
  if (!order) notFound();

  const user = (order as typeof order & { User?: User }).User;
  const items = (order as typeof order & { OrderItems?: OrderItem[] }).OrderItems ?? [];

  const adjustmentHistory = await OrderItemHistory.findAll({
    where: { orderId: order.id, action: "updated" },
    order: [["createdAt", "DESC"]],
  });
  // adjustmentHistory is sorted newest-first, so the first entry seen per
  // product here is its latest settled weight — used to prefill "Actual
  // (kg)" and as the diff baseline going forward, while item.quantity
  // (below) stays the untouched, originally-ordered weight for the
  // "Ordered" column.
  const latestActualByProduct = new Map<string, number>();
  for (const h of adjustmentHistory) {
    if (latestActualByProduct.has(h.productName)) continue;
    try {
      const after: WeightSnapshot = JSON.parse(h.snapshotAfter ?? "{}");
      if (typeof after.quantity === "number") latestActualByProduct.set(h.productName, after.quantity);
    } catch {
      // leave unset — falls back to the ordered quantity below
    }
  }
  const totalAdjustment = adjustmentHistory.reduce((sum, h) => {
    try {
      const before: WeightSnapshot = JSON.parse(h.snapshotBefore ?? "{}");
      const after: WeightSnapshot = JSON.parse(h.snapshotAfter ?? "{}");
      return sum + ((after.totalPrice ?? 0) - (before.totalPrice ?? 0));
    } catch {
      return sum;
    }
  }, 0);

  return (
    <div className="flex h-full flex-col">
      <AdminPageHeader title={`#${order.orderNumber}`} subtitle="Order Detail">
        <OrderStatusSelect orderId={order.id} status={order.orderStatus} />
      </AdminPageHeader>

      <div className="flex-1 overflow-y-auto p-5">
        <Link href="/admin/orders" className="mb-4 inline-block text-[13px] font-bold text-[#e05a4a]">
          ← Back to Orders
        </Link>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-md border border-[#e4e1dc] bg-white">
              <div className="border-b border-[#e4e1dc] px-4 py-3">
                <div className="text-[14px] font-bold text-[#1a1816]">Order Items</div>
                <p className="mt-0.5 text-[13px] text-[#9a9490]">
                  Whole cuts don&apos;t always hit an exact weight. Enter the actual delivered weight
                  to record the adjustment and email the customer — this does not touch the
                  original invoice or charge/refund automatically.
                </p>
              </div>
              <div className="overflow-x-auto">
                <WeightAdjustmentTable
                  orderId={order.id}
                  items={items.map((item) => ({
                    id: item.id,
                    productName: item.productName,
                    sku: item.sku,
                    quantity: Number(item.quantity),
                    actualQuantity:
                      latestActualByProduct.get(item.productName ?? "") ?? Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    totalPrice: Number(item.totalPrice),
                  }))}
                />
              </div>
            </div>

            {adjustmentHistory.length > 0 && (
              <div className="rounded-md border border-[#e4e1dc] bg-white">
                <div className="flex items-center justify-between border-b border-[#e4e1dc] px-4 py-3">
                  <div className="text-[14px] font-bold text-[#1a1816]">Weight Adjustment History</div>
                  <div
                    className={`text-[13px] font-bold ${
                      totalAdjustment > 0
                        ? "text-[#c48a00]"
                        : totalAdjustment < 0
                          ? "text-[#1e8a4a]"
                          : "text-[#9a9490]"
                    }`}
                  >
                    {totalAdjustment === 0
                      ? "Settled — no net change"
                      : totalAdjustment > 0
                        ? `$${totalAdjustment.toFixed(2)} due from customer`
                        : `$${Math.abs(totalAdjustment).toFixed(2)} owed to customer`}
                  </div>
                </div>
                <div className="divide-y divide-[#e4e1dc]">
                  {adjustmentHistory.map((h) => {
                    let before: WeightSnapshot = { quantity: 0, unitPrice: 0, totalPrice: 0 };
                    let after: WeightSnapshot = { quantity: 0, unitPrice: 0, totalPrice: 0 };
                    try {
                      before = JSON.parse(h.snapshotBefore ?? "{}");
                      after = JSON.parse(h.snapshotAfter ?? "{}");
                    } catch {
                      // leave defaults
                    }
                    const diff = (after.totalPrice ?? 0) - (before.totalPrice ?? 0);
                    return (
                      <div key={h.id} className="px-4 py-2.5 text-[14px]">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#1a1816]">{h.productName}</span>
                          <span
                            className={`font-bold ${diff > 0 ? "text-[#c48a00]" : diff < 0 ? "text-[#1e8a4a]" : "text-[#9a9490]"}`}
                          >
                            {diff > 0 ? "+" : ""}${diff.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[13px] text-[#9a9490]">
                          {before.quantity}kg → {after.quantity}kg · {new Date(h.createdAt).toLocaleString()}
                          {before.note ? ` · "${before.note}"` : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-md border border-[#e4e1dc] bg-white p-4">
              <div className="mb-2 text-[13px] font-bold tracking-wide text-[#9a9490] uppercase">Customer</div>
              <div className="text-[14px] font-semibold text-[#1a1816]">
                {user?.businessName || user?.contactName || "—"}
              </div>
              <div className="text-[14px] text-[#5a5450]">{user?.email}</div>
              <div className="text-[14px] text-[#5a5450]">{user?.phone}</div>
            </div>

            <div className="rounded-md border border-[#e4e1dc] bg-white p-4">
              <div className="mb-2 text-[13px] font-bold tracking-wide text-[#9a9490] uppercase">Delivery</div>
              <div className="text-[14px] text-[#1a1816]">{order.deliveryDate || "—"}</div>
              <div className="text-[14px] text-[#5a5450]">{order.timeSlot || "—"}</div>
              <div className="text-[14px] text-[#5a5450]">{order.shippingType || "—"}</div>
            </div>

            <div className="rounded-md border border-[#e4e1dc] bg-white p-4">
              <div className="mb-2 text-[13px] font-bold tracking-wide text-[#9a9490] uppercase">Payment</div>
              <div className="flex justify-between py-0.5 text-[14px]">
                <span className="text-[#9a9490]">Subtotal</span>
                <span className="font-semibold text-[#1a1816]">${Number(order.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-0.5 text-[14px]">
                <span className="text-[#9a9490]">GST</span>
                <span className="font-semibold text-[#1a1816]">${Number(order.gstAmount ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-[#e4e1dc] py-1.5 pt-2 text-[14px]">
                <span className="font-bold text-[#1a1816]">Total</span>
                <span className="font-[family-name:var(--font-plex-mono)] font-bold text-[#c04535]">
                  ${Number(order.finalAmount).toFixed(2)}
                </span>
              </div>
              <div className="mt-2 text-[13px] text-[#9a9490]">
                {order.paymentMethod} · {order.paymentStatus}
              </div>
              {order.paymentMethod === "Online" && (
                <div className="mt-3 space-y-1.5 border-t border-[#e4e1dc] pt-3 text-[14px]">
                  {order.cardBrand && order.cardLast4 && (
                    <div className="flex justify-between">
                      <span className="text-[#9a9490]">Card</span>
                      <span className="font-semibold text-[#1a1816]">
                        {order.cardBrand} •••• {order.cardLast4}
                      </span>
                    </div>
                  )}
                  {order.stripePaymentIntentId && (
                    <div className="flex justify-between gap-2">
                      <span className="shrink-0 text-[#9a9490]">Payment intent</span>
                      <span className="truncate font-[family-name:var(--font-plex-mono)] text-[13px] text-[#5a5450]">
                        {order.stripePaymentIntentId}
                      </span>
                    </div>
                  )}
                  {order.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-[#9a9490]">Paid at</span>
                      <span className="font-semibold text-[#1a1816]">{new Date(order.paidAt).toLocaleString()}</span>
                    </div>
                  )}
                  {order.receiptUrl && (
                    <a
                      href={order.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block font-bold text-[#e05a4a] hover:underline"
                    >
                      View Stripe receipt ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
