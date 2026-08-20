import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getOrderDetail } from "@/lib/db/queries/account";
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
  const substitutedNames = new Set(
    order.revisions.filter((r) => r.action === "updated").map((r) => r.productName),
  );

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
        Items ({order.items.length})
      </div>
      <div className="mx-4 mb-1 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
        {order.items.map((item, i) => {
          const substituted = substitutedNames.has(item.productName);
          return (
            <div
              key={`${item.productName}-${i}`}
              className={`flex items-center gap-2.5 px-4 py-3.25 ${substituted ? "bg-amber-50" : ""}`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[1.15rem] ${
                  substituted ? "border border-amber-300 bg-amber-50" : "bg-primary-50"
                }`}
              >
                🥩
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[0.84rem] font-bold text-neutral-900">
                  {item.productName}
                  {substituted && (
                    <span className="ml-1.5 rounded-md border border-amber-300 bg-amber-50 px-1.5 py-0.25 text-[0.62rem] font-extrabold text-amber-700">
                      Substituted
                    </span>
                  )}
                </div>
                <div
                  className={`text-[0.72rem] ${substituted ? "text-amber-700" : "text-neutral-400"}`}
                >
                  {substituted
                    ? "See revision log below for details"
                    : `${item.quantity} · ${item.sku ?? ""}`}
                </div>
              </div>
              <div className="shrink-0 font-serif text-[0.95rem] font-bold text-primary-600">
                {formatMoney(item.totalPrice)}
              </div>
            </div>
          );
        })}
      </div>

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
                    {ACTION_LABEL[r.action] ?? r.action} — {r.productName}
                  </div>
                  <div className="text-[0.7rem] text-neutral-400">{formatDateTime(r.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-3 flex gap-2 px-4 lg:px-0">
        <ReorderButton orderNumber={order.orderNumber} className="flex-1" />
        <a
          href="https://wa.me/17807227623"
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-[1.5px] border-neutral-200 bg-white px-4 py-4 text-[0.92rem] font-extrabold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          💬 Question
        </a>
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
