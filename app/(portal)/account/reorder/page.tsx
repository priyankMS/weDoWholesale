import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getReorderCandidates } from "@/lib/db/queries/account";
import { formatDate, formatMoney } from "@/lib/format";
import { AccountHeader } from "@/components/portal/AccountHeader";
import { OrderStatusBadge } from "@/components/portal/OrderStatusBadge";
import { NoticeCard } from "@/components/ui/NoticeCard";
import { ReorderButton } from "@/components/portal/ReorderButton";

export default async function ReorderPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const orders = await getReorderCandidates(session.userId);

  return (
    <div className="pb-8">
      <AccountHeader title="Quick reorder" subtitle="Repeat a previous order in one tap" />

      <div className="px-4 pt-3.5 lg:px-0 lg:pt-0">
        <NoticeCard icon="⚡" title="One tap to reorder">
          Load any past order into your cart with a single tap. Review and adjust quantities
          before confirming at checkout.
        </NoticeCard>
      </div>

      <div className="px-4 pt-1.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Recent orders
      </div>

      {orders.length === 0 && (
        <div className="mx-4 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-6 text-center text-[0.86rem] text-neutral-400 lg:mx-0">
          You don&apos;t have any past orders to reorder from yet.
        </div>
      )}

      <div className="lg:grid lg:grid-cols-2 lg:gap-3.5">
        {orders.map((order) => {
          const preview = order.items.slice(0, 3);
          const more = order.items.length - preview.length;
          return (
            <div
              key={order.orderNumber}
              className="mx-4 mb-3.5 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0"
            >
              <div className="flex items-start justify-between border-b border-neutral-200 px-4 py-3.5">
                <div>
                  <div className="mb-0.5 text-[0.9rem] font-extrabold text-neutral-900">
                    #{order.orderNumber} — {formatDate(order.createdAt, false)}
                  </div>
                  <div className="text-[0.72rem] text-neutral-400">
                    {formatMoney(order.finalAmount)} · {order.items.length} item
                    {order.items.length === 1 ? "" : "s"}
                  </div>
                </div>
                <OrderStatusBadge status={order.orderStatus} />
              </div>
              <div className="px-4 py-2.5">
                {preview.map((item, i) => (
                  <div key={i} className="py-0.75 text-[0.82rem] text-neutral-700">
                    {item.productName}
                  </div>
                ))}
                {more > 0 && (
                  <div className="pb-1 text-[0.74rem] text-neutral-400">+{more} more item{more === 1 ? "" : "s"}</div>
                )}
              </div>
              <div className="px-4 pb-3.5">
                <ReorderButton orderNumber={order.orderNumber} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
