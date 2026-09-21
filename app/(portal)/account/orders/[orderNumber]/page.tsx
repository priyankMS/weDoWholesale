import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getOrderDetail } from "@/lib/db/queries/account";
import { revisionRowChanged } from "@/lib/db/queries/adminOrders";
import { formatDateTime, formatMoney } from "@/lib/format";
import { AccountHeader } from "@/components/portal/AccountHeader";
import { OrderStatusBadge } from "@/components/portal/OrderStatusBadge";
import { Timeline, type TimelineItem } from "@/components/ui/Timeline";
import { ReorderButton } from "@/components/portal/ReorderButton";

const ACTION_LABEL: Record<string, string> = {
  added: "Item added",
  updated: "Substitution",
  removed: "Item removed",
};
const ACTION_DOT: Record<string, string> = {
  added: "bg-green-50 border-green-600",
  updated: "bg-amber-50 border-amber-500",
  removed: "bg-neutral-100 border-neutral-300",
};

function buildTimeline(order: {
  createdAt: Date;
  updatedAt: Date;
  orderStatus: string | null;
  deliveryDate: string | null;
}): TimelineItem[] {
  const confirmed = order.orderStatus !== "pending";
  const dispatched = order.orderStatus === "shipped" || order.orderStatus === "delivered";
  const delivered = order.orderStatus === "delivered";

  return [
    { status: "done", icon: "✓", title: "Order placed", desc: formatDateTime(order.createdAt) },
    {
      status: confirmed ? "done" : "active",
      icon: confirmed ? "✓" : "…",
      title: "Order confirmed",
      desc: confirmed ? "Confirmed by our team" : "Awaiting confirmation",
    },
    {
      status: dispatched ? "done" : confirmed ? "active" : "pending",
      icon: dispatched ? "✓" : "…",
      title: "Packed and dispatched",
      desc: dispatched ? formatDateTime(order.updatedAt) : "Not yet dispatched",
    },
    {
      status: delivered ? "done" : dispatched ? "active" : "pending",
      icon: delivered ? "✓" : "…",
      title: "Delivered",
      desc: delivered
        ? formatDateTime(order.updatedAt)
        : order.deliveryDate
          ? `Expected ${order.deliveryDate}`
          : "Not yet delivered",
    },
  ];
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { orderNumber } = await params;
  const order = await getOrderDetail(session.userId, orderNumber);
  if (!order) notFound();

  const cancelled = order.orderStatus === "cancelled" || order.orderStatus === "returned";
  const itemRows = order.revision?.rows ?? [];
  // Table 1 ("Your Order") is exactly what was originally placed — items
  // added later never appeared in the original order, so they're excluded
  // here (they only show up in the "What Changed" table below).
  const originalItemRows = itemRows.filter((row) => row.original);
  const changedRevisionRows = itemRows.filter(revisionRowChanged);

  return (
    <div className="pb-24 lg:pb-8">
      <AccountHeader
        title={`#${order.orderNumber}`}
        subtitle={formatDateTime(order.createdAt)}
        backHref="/account/orders"
        backLabel="Orders"
        mobileAction={<OrderStatusBadge status={order.orderStatus} />}
        desktopAction={<OrderStatusBadge status={order.orderStatus} />}
      />

      {cancelled ? (
        <div className="mx-4 mt-4 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-5 text-[0.86rem] text-neutral-500 lg:mx-0">
          This order was cancelled and was not fulfilled.
        </div>
      ) : (
        <>
          <div className="px-4 pt-3.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
            Delivery status
          </div>
          <div className="mx-4 mb-1 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4.5 lg:mx-0">
            <Timeline items={buildTimeline(order)} />
          </div>
        </>
      )}

      <div className="px-4 pt-3.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Your Order ({originalItemRows.length} item{originalItemRows.length === 1 ? "" : "s"})
      </div>
      <div className="mx-4 mb-1 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-[0.78rem]">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-[0.62rem] font-extrabold tracking-wide text-neutral-400 uppercase">
                <th className="px-4 py-2 font-extrabold">Item</th>
                <th className="px-2 py-2 text-right font-extrabold">Qty</th>
                <th className="px-4 py-2 text-right font-extrabold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {originalItemRows.map((row) => (
                <tr key={row.orderItemId}>
                  <td className="px-4 py-2.5 align-top">
                    <div className="font-bold text-neutral-900">{row.original!.productName}</div>
                    {row.original!.sku && (
                      <div className="text-[0.7rem] text-neutral-400">{row.original!.sku}</div>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-right align-top font-semibold text-neutral-700 whitespace-nowrap">
                    {row.original!.quantity} {row.original!.unit}
                  </td>
                  <td className="px-4 py-2.5 text-right align-top font-bold text-neutral-900 whitespace-nowrap">
                    {formatMoney(row.original!.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-2.75 text-[0.86rem]">
          <span className="font-bold text-neutral-900">
            {order.revision ? "Originally ordered" : "Order total"}
          </span>
          <span className="font-serif text-[1rem] font-bold text-neutral-900">
            {formatMoney(order.revision?.originalTotal ?? order.finalAmount)}
          </span>
        </div>
      </div>

      {changedRevisionRows.length > 0 && order.revision && (
        <>
          <div className="px-4 pt-3.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
            What Changed
          </div>
          <div className="mx-4 mb-1 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
            <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2.5 text-[0.76rem] text-neutral-500">
              We had to update your order after it was packed — here&apos;s what changed and how it affects your
              bill.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-[0.78rem]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-[0.62rem] font-extrabold tracking-wide text-neutral-400 uppercase">
                    <th className="px-4 py-2 font-extrabold">Item</th>
                    <th className="px-2 py-2 font-extrabold">Change</th>
                    <th className="px-4 py-2 text-right font-extrabold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {changedRevisionRows.map((row) => {
                    const diff = row.revised.totalPrice - (row.original?.totalPrice ?? 0);
                    const isSubstituted = row.original && row.original.productName !== row.revised.productName;
                    const description = !row.original
                      ? "New item added"
                      : isSubstituted
                        ? `Replaced "${row.original.productName}"`
                        : `${row.original.quantity} ${row.original.unit} → ${row.revised.quantity} ${row.revised.unit}`;
                    return (
                      <tr key={row.orderItemId}>
                        <td className="px-4 py-2.5 align-top font-bold text-neutral-900">
                          {row.revised.productName}
                        </td>
                        <td className="px-2 py-2.5 align-top text-[0.72rem] text-neutral-400">{description}</td>
                        <td
                          className={`px-4 py-2.5 text-right align-top font-serif text-[0.95rem] font-bold whitespace-nowrap ${
                            diff >= 0 ? "text-amber-600" : "text-green-600"
                          }`}
                        >
                          {diff >= 0 ? "+" : "−"}
                          {formatMoney(Math.abs(diff))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-1 border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-neutral-500">What you were originally charged</span>
                <span className="font-semibold text-neutral-900">{formatMoney(order.revision.originalTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Your new order total</span>
                <span className="font-bold text-neutral-900">{formatMoney(order.revision.revisedTotal)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-neutral-900">
                  {order.revision.balanceAdjustment > 0.005 ? "You owe" : "You're owed a refund of"}
                </span>
                <span
                  className={`font-serif text-[1rem] font-bold ${
                    order.revision.balanceAdjustment > 0.005 ? "text-amber-600" : "text-green-600"
                  }`}
                >
                  {formatMoney(Math.abs(order.revision.balanceAdjustment))}
                </span>
              </div>
              <div className="text-[0.72rem] text-neutral-400">
                {order.revision.balanceAdjustment > 0.005
                  ? "This extra amount is included in the order total below."
                  : "This will be refunded to your original payment method."}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="px-4 pt-3.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Order total
      </div>
      <div className="mx-4 mb-1 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
        <TotalRow label="Subtotal" value={formatMoney(order.totalAmount)} />
        <TotalRow label="GST (5%)" value={formatMoney(order.gstAmount)} />
        <TotalRow
          label="Delivery"
          value={order.shippingFee > 0 ? formatMoney(order.shippingFee) : "Free"}
          valueClass={order.shippingFee > 0 ? "" : "text-green-600"}
        />
        {order.codCharges > 0 && (
          <TotalRow label="Cash handling surcharge" value={formatMoney(order.codCharges)} />
        )}
        <div className="flex items-center justify-between bg-neutral-50 px-4 py-3.25 text-[0.95rem] font-extrabold text-neutral-900">
          <span>Total</span>
          <span className="font-serif text-[1.1rem] text-primary-600">
            {formatMoney(order.finalAmount)}
          </span>
        </div>
      </div>

      <div className="px-4 pt-3.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Payment
      </div>
      <div className="mx-4 mb-1 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
        <TotalRow
          label="Method"
          value={
            order.paymentMethod === "Online"
              ? order.cardBrand && order.cardLast4
                ? `${order.cardBrand} •••• ${order.cardLast4}`
                : "Card (Stripe)"
              : "Cash on delivery"
          }
        />
        {order.paidAt && <TotalRow label="Paid on" value={formatDateTime(order.paidAt)} />}
        {order.paymentMethod === "Online" && (
          <div className="px-4 py-3.25">
            {order.receiptUrl ? (
              <a
                href={order.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-neutral-200 py-2.5 text-[0.82rem] font-bold text-primary-600 hover:bg-primary-50"
              >
                ⬇ Download receipt
              </a>
            ) : order.paymentStatus === "Failed" ? (
              <div className="text-center text-[0.78rem] font-semibold text-red-500">
                Payment failed — this order was not charged.
              </div>
            ) : (
              <div className="text-center text-[0.78rem] text-neutral-400">
                Receipt will appear here once payment is confirmed.
              </div>
            )}
          </div>
        )}
      </div>

      {order.revisions.length > 0 && (
        <>
          <div className="px-4 pt-3.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
            Revision log
          </div>
          <div className="mx-4 mb-1 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
            {order.revisions.map((r, i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <div
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full border ${ACTION_DOT[r.action] ?? "bg-neutral-100 border-neutral-300"}`}
                />
                <div className="flex-1">
                  <div className="mb-0.5 text-[0.84rem] font-bold text-neutral-900">
                    {r.weightAdjustment ? "Final weight recorded" : (ACTION_LABEL[r.action] ?? r.action)} —{" "}
                    {r.productName}
                  </div>
                  {r.weightAdjustment ? (
                    <>
                      <div className="text-[0.78rem] text-neutral-500">
                        Ordered {r.weightAdjustment.beforeQty} {r.weightAdjustment.unit} → Actual{" "}
                        {r.weightAdjustment.afterQty} {r.weightAdjustment.unit}
                        {Math.abs(r.weightAdjustment.adjustmentAmount) >= 0.005 && (
                          <span
                            className={`ml-1.5 font-bold ${
                              r.weightAdjustment.adjustmentAmount > 0
                                ? "text-amber-600"
                                : "text-green-600"
                            }`}
                          >
                            {r.weightAdjustment.adjustmentAmount > 0
                              ? `${formatMoney(r.weightAdjustment.adjustmentAmount)} due`
                              : `${formatMoney(Math.abs(r.weightAdjustment.adjustmentAmount))} refund`}
                          </span>
                        )}
                      </div>
                      {r.weightAdjustment.note && (
                        <div className="mt-0.5 text-[0.76rem] text-neutral-500 italic">
                          &quot;{r.weightAdjustment.note}&quot;
                        </div>
                      )}
                    </>
                  ) : null}
                  <div className="mt-0.5 text-[0.7rem] text-neutral-400">{formatDateTime(r.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-3 flex gap-2 px-4 lg:px-0">
        <a
          href={`/api/account/orders/${order.orderNumber}/invoice?format=pdf`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-neutral-200 bg-white px-3 py-3 text-[0.82rem] font-extrabold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          ⬇ PDF
        </a>
        <a
          href={`/api/account/orders/${order.orderNumber}/invoice?format=xlsx`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-neutral-200 bg-white px-3 py-3 text-[0.82rem] font-extrabold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          ⬇ Excel
        </a>
      </div>

      <div className="mt-2 flex gap-2 px-4 lg:px-0">
        <ReorderButton orderNumber={order.orderNumber} className="flex-1" />
        <Link
          href={`/messages/new?order=${encodeURIComponent(order.orderNumber)}&topic=invoice`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-[1.5px] border-neutral-200 bg-white px-4 py-4 text-[0.92rem] font-extrabold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          💬 Question
        </Link>
      </div>
    </div>
  );
}

function TotalRow({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.75 text-[0.86rem]">
      <span className="text-neutral-500">{label}</span>
      <span className={`font-bold text-neutral-900 ${valueClass}`}>{value}</span>
    </div>
  );
}
