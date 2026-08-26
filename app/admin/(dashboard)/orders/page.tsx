import Link from "next/link";
import { listAdminOrders } from "@/lib/db/queries/adminOrders";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { AdminTableCard } from "@/components/admin/AdminTableCard";
import { AdminBadge, type AdminBadgeTone } from "@/components/admin/AdminBadge";
import { AdminPageHeader, AdminHeaderGhostLink } from "@/components/admin/AdminPageHeader";
import { AdminToolbar, AdminChipLink, AdminToolbarSpacer, AdminCountBadge } from "@/components/admin/AdminToolbar";
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

const PAYMENT_STATUS_TONE: Record<string, AdminBadgeTone> = {
  Completed: "green",
  Pending: "amber",
  Failed: "red",
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

  const exportHref = `/api/admin/export/orders${sp.status ? `?status=${sp.status}` : ""}`;

  return (
    <div className="flex h-full flex-col">
      <AdminPageHeader title="Orders" subtitle={`${total} orders`}>
        <AdminHeaderGhostLink href={exportHref}>⬇ Export</AdminHeaderGhostLink>
      </AdminPageHeader>

      <div className="flex-1 overflow-y-auto p-5">
        <AdminToolbar>
          <AdminChipLink active={!sp.status} href={statusHref(undefined)}>
            All
          </AdminChipLink>
          {STATUSES.map((s) => (
            <AdminChipLink key={s} active={sp.status === s} href={statusHref(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </AdminChipLink>
          ))}
          <AdminToolbarSpacer />
          <AdminCountBadge>{total} active orders</AdminCountBadge>
        </AdminToolbar>

        <AdminTableCard>
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="bg-[#f0ede9]">
                {["Order ID", "Customer", "Items", "Total", "Status", "Payment", "Placed", "Delivery Date"].map((h) => (
                  <th key={h} className="px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase">
                    {h}
                  </th>
                ))}
                <th className="w-16 px-2.5 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr
                  key={o.id}
                  className={`border-b border-[#e4e1dc] last:border-0 hover:bg-[#fff5f4] ${
                    i % 2 === 1 ? "bg-[#faf9f7]" : "bg-white"
                  }`}
                >
                  <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] text-[14px] font-semibold text-[#1a1816]">
                    #{o.orderNumber}
                  </td>
                  <td className="px-2.5 py-1.5 text-[#5a5450]">{o.customerName}</td>
                  <td className="px-2.5 py-1.5 text-[#5a5450]">{o.itemCount}</td>
                  <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] font-bold text-[#c04535]">
                    ${o.finalAmount.toFixed(2)}
                  </td>
                  <td className="px-2.5 py-1.5">
                    <OrderStatusSelect orderId={o.id} status={o.orderStatus} />
                  </td>
                  <td className="px-2.5 py-1.5">
                    <div className="text-[#5a5450]">{o.paymentMethod === "Online" ? "Online" : "COD"}</div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <AdminBadge tone={PAYMENT_STATUS_TONE[o.paymentStatus] ?? "neutral"}>
                        {o.paymentStatus}
                      </AdminBadge>
                    </div>
                    {o.paidAt && <div className="mt-0.5 text-[12px] text-[#c4c0bc]">{formatDate(o.paidAt)}</div>}
                  </td>
                  <td className="px-2.5 py-1.5 text-[#9a9490]">{formatDate(o.createdAt)}</td>
                  <td className="px-2.5 py-1.5 text-[#9a9490]">{o.deliveryDate || "—"}</td>
                  <td className="px-2.5 py-1.5 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="rounded p-1 text-[15px] hover:bg-[#fdf2f1]" aria-label="View">
                      👁
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[#9a9490]">
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
                className={`rounded-md px-3 py-1.5 text-[13px] font-bold ${
                  p === page
                    ? "bg-[#e05a4a] text-white"
                    : "border border-[#e4e1dc] bg-white text-[#5a5450] hover:bg-[#f0ede9]"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
