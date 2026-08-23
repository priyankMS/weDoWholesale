import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminOrderDetail } from "@/lib/db/queries/adminOrders";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { User } from "@/lib/db/models/User";
import { OrderItem } from "@/lib/db/models/OrderItem";

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
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-4 py-3 text-[0.9rem] font-bold text-neutral-900">
              Order Items
            </div>
            <table className="w-full text-left text-[0.9rem]">
              <thead>
                <tr className="border-b border-neutral-100 text-[0.78rem] font-bold tracking-wide text-neutral-400 uppercase">
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2">SKU</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Unit Price</th>
                  <th className="px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-2.5 font-semibold text-neutral-900">{item.productName}</td>
                    <td className="px-4 py-2.5 font-mono text-[0.84rem] text-neutral-500">
                      {item.sku || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">{Number(item.quantity)}</td>
                    <td className="px-4 py-2.5 text-neutral-600">${Number(item.unitPrice).toFixed(2)}</td>
                    <td className="px-4 py-2.5 font-semibold text-neutral-900">
                      ${Number(item.totalPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                      No items.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
