import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getOrderHistory } from "@/lib/db/queries/account";
import { formatDate, formatMoney, formatMonthYear } from "@/lib/format";
import { AccountHeader } from "@/components/portal/AccountHeader";
import { OrderStatusBadge } from "@/components/portal/OrderStatusBadge";

const FILTERS = [
  { key: "all", label: "All orders" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const ACTIVE_STATUSES = new Set(["pending", "new", "shipped"]);
const CANCELLED_STATUSES = new Set(["cancelled", "returned"]);

export default async function OrderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { filter: rawFilter } = await searchParams;
  const filter: FilterKey = FILTERS.some((f) => f.key === rawFilter)
    ? (rawFilter as FilterKey)
    : "all";

  const orders = await getOrderHistory(session.userId);
  const filtered = orders.filter((o) => {
    if (filter === "active") return ACTIVE_STATUSES.has(o.orderStatus ?? "");
    if (filter === "delivered") return o.orderStatus === "delivered";
    if (filter === "cancelled") return CANCELLED_STATUSES.has(o.orderStatus ?? "");
    return true;
  });

  const groups = new Map<string, typeof filtered>();
  for (const order of filtered) {
    const key = formatMonthYear(order.createdAt);
    const existing = groups.get(key);
    if (existing) existing.push(order);
    else groups.set(key, [order]);
  }

  return (
    <div className="pb-8">
      <AccountHeader title="Order history" subtitle="View and track all your past orders" />

      <div className="scrollbar-none flex gap-1.75 overflow-x-auto px-4 pt-3.5 pb-1 lg:px-0">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/account/orders" : `/account/orders?filter=${f.key}`}
            className={`shrink-0 rounded-full border-[1.5px] px-3.5 py-1.75 text-[0.78rem] font-semibold whitespace-nowrap ${
              filter === f.key
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-neutral-200 bg-white text-neutral-700"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mx-4 mt-4 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-6 text-center text-[0.86rem] text-neutral-400 lg:mx-0">
          No orders in this view yet.
        </div>
      )}

      {Array.from(groups.entries()).map(([month, monthOrders]) => (
        <div key={month}>
          <div className="px-4 pt-3.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
            {month}
          </div>
          <div className="mx-4 mb-1 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
            {monthOrders.map((order) => (
              <Link
                key={order.orderNumber}
                href={`/account/orders/${order.orderNumber}`}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-neutral-50"
              >
                <div
                  className={`flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[9px] border text-[1.1rem] ${
                    order.orderStatus === "cancelled" || order.orderStatus === "returned"
                      ? "border-neutral-200 bg-neutral-100"
                      : "border-green-200 bg-green-50"
                  }`}
                >
                  {order.orderStatus === "delivered"
                    ? "✓"
                    : order.orderStatus === "cancelled" || order.orderStatus === "returned"
                      ? "✕"
                      : "🚚"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.88rem] font-extrabold text-neutral-900">
                    #{order.orderNumber}
                  </div>
                  <div className="text-[0.72rem] text-neutral-400">
                    {formatDate(order.createdAt, false)} · {order.itemCount} item
                    {order.itemCount === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="mb-0.75 font-serif text-[1rem] font-bold text-neutral-900">
                    {formatMoney(order.finalAmount)}
                  </div>
                  <OrderStatusBadge status={order.orderStatus} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
