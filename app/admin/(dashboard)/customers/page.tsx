import Link from "next/link";
import { listAdminCustomers } from "@/lib/db/queries/adminCustomers";
import { AdminTableCard } from "@/components/admin/AdminTableCard";
import { CustomerStatusActions } from "@/components/admin/CustomerStatusActions";
import type { AccountStatus } from "@/lib/db/models/User";

const PAGE_SIZE = 25;

const TABS: { value: AccountStatus | "all"; label: string }[] = [
  { value: "pending_review", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const STATUS_BADGE: Record<AccountStatus, string> = {
  pending_review: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<AccountStatus, string> = {
  pending_review: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

const MONTHLY_VOLUME_LABEL: Record<string, string> = {
  under_50kg: "Under 50 kg",
  "50_100kg": "50 – 100 kg",
  "100_200kg": "100 – 200 kg",
  "200_500kg": "200 – 500 kg",
  "500kg_plus": "500 kg+",
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const status = (sp.status as AccountStatus | "all") || "pending_review";

  const { customers, total } = await listAdminCustomers({
    status,
    search: sp.q,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function tabHref(value: string) {
    const params = new URLSearchParams();
    params.set("status", value);
    if (sp.q) params.set("q", sp.q);
    return `/admin/customers?${params.toString()}`;
  }

  function pageHref(p: number) {
    const params = new URLSearchParams();
    params.set("status", status);
    if (sp.q) params.set("q", sp.q);
    params.set("page", String(p));
    return `/admin/customers?${params.toString()}`;
  }

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="font-serif text-xl font-black text-neutral-900">Customers</h1>
        <p className="text-[0.82rem] text-neutral-500">
          Wholesale account applications — approve or reject sign-ups. Only approved accounts can
          check out.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((tab) => (
            <Link
              key={tab.value}
              href={tabHref(tab.value)}
              className={`rounded-full px-3.5 py-1.5 text-[0.8rem] font-bold ${
                status === tab.value
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form className="flex items-center gap-2" method="get">
          <input type="hidden" name="status" value={status} />
          <input
            type="text"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search business, contact, or email…"
            className="min-w-[240px] rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-[0.84rem] outline-none focus:border-red-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-[0.82rem] font-bold text-white hover:bg-neutral-800"
          >
            Search
          </button>
        </form>
      </div>

      <AdminTableCard>
        <table className="w-full text-left text-[0.82rem]">
          <thead>
            <tr className="border-b border-neutral-100 text-[0.7rem] font-bold tracking-wide text-neutral-400 uppercase">
              <th className="px-4 py-2.5">Business</th>
              <th className="px-4 py-2.5">Contact</th>
              <th className="px-4 py-2.5">City</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Est. volume</th>
              <th className="px-4 py-2.5">Applied</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-2.5 font-semibold text-neutral-900">
                  {c.businessName || "—"}
                </td>
                <td className="px-4 py-2.5 text-neutral-600">
                  <div>{c.contactName || "—"}</div>
                  <div className="text-[0.72rem] text-neutral-400">{c.email}</div>
                  {c.phone && <div className="text-[0.72rem] text-neutral-400">{c.phone}</div>}
                </td>
                <td className="px-4 py-2.5 text-neutral-600">{c.city || "—"}</td>
                <td className="px-4 py-2.5 text-neutral-600 capitalize">{c.businessType || "—"}</td>
                <td className="px-4 py-2.5 text-neutral-600">
                  {c.monthlyVolume ? MONTHLY_VOLUME_LABEL[c.monthlyVolume] ?? c.monthlyVolume : "—"}
                </td>
                <td className="px-4 py-2.5 text-neutral-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${STATUS_BADGE[c.status]}`}>
                    {STATUS_LABEL[c.status]}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <CustomerStatusActions customerId={c.id} businessName={c.businessName} status={c.status} />
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-400">
                  No customers in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminTableCard>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
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
