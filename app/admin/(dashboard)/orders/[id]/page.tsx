import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminOrderDetail, getOrderRevisionView } from "@/lib/db/queries/adminOrders";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrderItemsEditTable } from "@/components/admin/OrderItemsEditTable";
import { AddOrderItemForm } from "@/components/admin/AddOrderItemForm";
import { OrderRevisionSummary } from "@/components/admin/OrderRevisionSummary";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmailInvoiceButton } from "@/components/admin/EmailInvoiceButton";
import { User } from "@/lib/db/models/User";
import { OrderItemHistory, type OrderItemAction } from "@/lib/db/models/OrderItemHistory";

const ACTION_LABEL: Record<OrderItemAction, string> = {
  added: "Added",
  updated: "Substituted / quantity changed",
  removed: "Removed",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderDetail(Number(id));
  if (!order) notFound();

  const user = (order as typeof order & { User?: User }).User;
  const revision = await getOrderRevisionView(order.id);

  const history = await OrderItemHistory.findAll({
    where: { orderId: order.id },
    order: [["createdAt", "DESC"]],
  });

  return (
    <div className="flex h-full flex-col">
      <AdminPageHeader title={`#${order.orderNumber}`} subtitle="Order Detail">
        <div className="flex items-center gap-2">
          <a
            href={`/api/admin/orders/${order.id}/invoice?format=pdf`}
            className="rounded-[5px] border border-[#d0ccc6] px-2.5 py-1.5 text-[13px] font-bold text-[#5a5450] hover:bg-[#f5f3f0]"
          >
            Download PDF
          </a>
          <a
            href={`/api/admin/orders/${order.id}/invoice?format=xlsx`}
            className="rounded-[5px] border border-[#d0ccc6] px-2.5 py-1.5 text-[13px] font-bold text-[#5a5450] hover:bg-[#f5f3f0]"
          >
            Download Excel
          </a>
          <EmailInvoiceButton orderId={order.id} />
          <OrderStatusSelect orderId={order.id} status={order.orderStatus} />
        </div>
      </AdminPageHeader>

      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5">
        <Link href="/admin/orders" className="mb-4 inline-block text-[13px] font-bold text-[#e05a4a]">
          ← Back to Orders
        </Link>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-md border border-[#e4e1dc] bg-white">
              <div className="border-b border-[#e4e1dc] px-4 py-3">
                <div className="text-[14px] font-bold text-[#1a1816]">Order Items</div>
                <p className="mt-0.5 text-[13px] text-[#9a9490]">
                  Edit a quantity, substitute a product, or add a new item — the order total, GST, and
                  refund/due amount below update automatically and the customer is notified.
                </p>
              </div>
              <div className="overflow-x-auto">
                <OrderItemsEditTable orderId={order.id} rows={revision?.rows ?? []} />
              </div>
              <AddOrderItemForm orderId={order.id} />
            </div>

            {history.length > 0 && (
              <div className="rounded-md border border-[#e4e1dc] bg-white">
                <div className="border-b border-[#e4e1dc] px-4 py-3">
                  <div className="text-[14px] font-bold text-[#1a1816]">Revision Activity</div>
                </div>
                <div className="divide-y divide-[#e4e1dc]">
                  {history.map((h) => (
                    <div key={h.id} className="px-4 py-2.5 text-[14px]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1a1816]">{h.productName}</span>
                        <span className="text-[12px] font-bold text-[#9a9490] uppercase">
                          {ACTION_LABEL[h.action]}
                        </span>
                      </div>
                      <div className="text-[13px] text-[#9a9490]">{new Date(h.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
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

            {revision?.isRevised ? (
              <OrderRevisionSummary
                originalTotal={revision.originalTotal}
                revisedTotal={revision.revisedTotal}
                balanceAdjustment={revision.balanceAdjustment}
              />
            ) : null}

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
