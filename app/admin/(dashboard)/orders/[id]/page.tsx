import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminOrderDetail } from "@/lib/db/queries/adminOrders";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { WeightAdjustmentTable } from "@/components/admin/WeightAdjustmentTable";
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
    <div className="p-6">
      <div className="mb-5">
        <Link href="/admin/orders" className="text-[0.8rem] font-bold text-red-600">
          ← Back to Orders
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-serif text-xl font-black text-neutral-900">#{order.orderNumber}</h1>
          <OrderStatusSelect orderId={order.id} status={order.orderStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-4 py-3">
              <div className="text-[0.9rem] font-bold text-neutral-900">Order Items</div>
              <p className="mt-0.5 text-[0.78rem] text-neutral-500">
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
                  unitPrice: Number(item.unitPrice),
                  totalPrice: Number(item.totalPrice),
                }))}
              />
            </div>
          </div>

          {adjustmentHistory.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                <div className="text-[0.9rem] font-bold text-neutral-900">Weight Adjustment History</div>
                <div
                  className={`text-[0.86rem] font-bold ${
                    totalAdjustment > 0
                      ? "text-amber-600"
                      : totalAdjustment < 0
                        ? "text-green-600"
                        : "text-neutral-400"
                  }`}
                >
                  {totalAdjustment === 0
                    ? "Settled — no net change"
                    : totalAdjustment > 0
                      ? `$${totalAdjustment.toFixed(2)} due from customer`
                      : `$${Math.abs(totalAdjustment).toFixed(2)} owed to customer`}
                </div>
              </div>
              <div className="divide-y divide-neutral-100">
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
                    <div key={h.id} className="px-4 py-2.5 text-[0.86rem]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-900">{h.productName}</span>
                        <span
                          className={`font-bold ${diff > 0 ? "text-amber-600" : diff < 0 ? "text-green-600" : "text-neutral-400"}`}
                        >
                          {diff > 0 ? "+" : ""}${diff.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[0.78rem] text-neutral-500">
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
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-2 text-[0.78rem] font-bold tracking-wide text-neutral-400 uppercase">
              Customer
            </div>
            <div className="text-[0.86rem] font-semibold text-neutral-900">
              {user?.businessName || user?.contactName || "—"}
            </div>
            <div className="text-[0.86rem] text-neutral-500">{user?.email}</div>
            <div className="text-[0.86rem] text-neutral-500">{user?.phone}</div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-2 text-[0.78rem] font-bold tracking-wide text-neutral-400 uppercase">
              Delivery
            </div>
            <div className="text-[0.9rem] text-neutral-700">{order.deliveryDate || "—"}</div>
            <div className="text-[0.86rem] text-neutral-500">{order.timeSlot || "—"}</div>
            <div className="text-[0.86rem] text-neutral-500">{order.shippingType || "—"}</div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-2 text-[0.78rem] font-bold tracking-wide text-neutral-400 uppercase">
              Payment
            </div>
            <div className="flex justify-between py-0.5 text-[0.9rem]">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-semibold text-neutral-900">${Number(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5 text-[0.9rem]">
              <span className="text-neutral-500">GST</span>
              <span className="font-semibold text-neutral-900">
                ${Number(order.gstAmount ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-100 py-1.5 pt-2 text-[0.86rem]">
              <span className="font-bold text-neutral-900">Total</span>
              <span className="font-bold text-neutral-900">${Number(order.finalAmount).toFixed(2)}</span>
            </div>
            <div className="mt-2 text-[0.84rem] text-neutral-500">
              {order.paymentMethod} · {order.paymentStatus}
            </div>
            {order.paymentMethod === "Online" && (
              <div className="mt-3 space-y-1.5 border-t border-neutral-100 pt-3 text-[0.86rem]">
                {order.cardBrand && order.cardLast4 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Card</span>
                    <span className="font-semibold text-neutral-900">
                      {order.cardBrand} •••• {order.cardLast4}
                    </span>
                  </div>
                )}
                {order.stripePaymentIntentId && (
                  <div className="flex justify-between gap-2">
                    <span className="shrink-0 text-neutral-500">Payment intent</span>
                    <span className="truncate font-mono text-[0.8rem] text-neutral-700">
                      {order.stripePaymentIntentId}
                    </span>
                  </div>
                )}
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Paid at</span>
                    <span className="font-semibold text-neutral-900">
                      {new Date(order.paidAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {order.receiptUrl && (
                  <a
                    href={order.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block font-bold text-red-600 hover:underline"
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
  );
}
