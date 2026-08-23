import Link from "next/link";
import { listAdminOrders } from "@/lib/db/queries/adminOrders";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { AdminTableCard } from "@/components/admin/AdminTableCard";
import type { OrderStatus } from "@/lib/db/models/Order";

const PAGE_SIZE = 20;
const STATUSES: OrderStatus[] = ["pending", "new", "shipped", "delivered", "cancelled", "returned"];

function formatDate(d: Date): string {
  return new Date(d).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  Completed: "bg-green-50 text-green-700",
  Pending: "bg-amber-50 text-amber-700",
  Failed: "bg-red-50 text-red-700",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: OrderStatus; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const { orders, total } = await listAdminOrders({ status: sp.status, page, pageSize: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (sp.status) params.set("status", sp.status);
    params.set("page", String(p));
    return `/admin/orders?${params.toString()}`;
  }

  function statusHref(status?: OrderStatus) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    return `/admin/orders?${params.toString()}`;
  }

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="font-serif text-xl font-black text-neutral-900">Orders</h1>
        <p className="text-[0.9rem] text-neutral-500">{total} orders</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Link
          href={statusHref(undefined)}
          className={`rounded-lg px-3 py-1.5 text-[0.86rem] font-bold ${
            !sp.status ? "bg-red-600 text-white" : "bg-white text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={statusHref(s)}
            className={`rounded-lg px-3 py-1.5 text-[0.86rem] font-bold capitalize ${
              sp.status === s ? "bg-red-600 text-white" : "bg-white text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <AdminTableCard>
        <table className="w-full text-left text-[0.9rem]">
          <thead>
            <tr className="border-b border-neutral-100 text-[0.78rem] font-bold tracking-wide text-neutral-400 uppercase">
              <th className="px-4 py-2.5">Order ID</th>
              <th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5">Items</th>
              <th className="px-4 py-2.5">Total</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Payment</th>
              <th className="px-4 py-2.5">Placed</th>
              <th className="px-4 py-2.5">Delivery Date</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-2.5 font-mono text-[0.86rem] font-semibold text-neutral-900">
                  #{o.orderNumber}
                </td>
                <td className="px-4 py-2.5 text-neutral-700">{o.customerName}</td>
                <td className="px-4 py-2.5 text-neutral-600">{o.itemCount}</td>
                <td className="px-4 py-2.5 font-semibold text-neutral-900">
                  ${o.finalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-2.5">
                  <OrderStatusSelect orderId={o.id} status={o.orderStatus} />
                </td>
                <td className="px-4 py-2.5">
                  <div className="text-neutral-700">
                    {o.paymentMethod === "Online" ? "Online" : "COD"}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-1.5 py-0.25 text-[0.74rem] font-bold ${
                        PAYMENT_STATUS_STYLE[o.paymentStatus] ?? "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </div>
                  {o.paidAt && (
                    <div className="mt-0.5 text-[0.8rem] text-neutral-400">
                      {formatDate(o.paidAt)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2.5 text-neutral-500">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-2.5 text-neutral-500">{o.deliveryDate || "—"}</td>
                <td className="px-4 py-2.5 text-right">
                  <Link href={`/admin/orders/${o.id}`} className="font-bold text-red-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-neutral-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminTableCard>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`rounded-lg px-3 py-1.5 text-[0.8rem] font-bold ${
                p === page ? "bg-red-600 text-white" : "bg-white text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
