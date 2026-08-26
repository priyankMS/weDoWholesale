import Link from "next/link";
import { listAdminCustomers } from "@/lib/db/queries/adminCustomers";
import { AdminTableCard } from "@/components/admin/AdminTableCard";
import { AdminBadge, type AdminBadgeTone } from "@/components/admin/AdminBadge";
import { CustomerStatusActions } from "@/components/admin/CustomerStatusActions";
import { AdminPageHeader, AdminHeaderSearch, AdminHeaderGhostLink } from "@/components/admin/AdminPageHeader";
import { AdminToolbar, AdminChipLink, AdminToolbarSpacer, AdminCountBadge } from "@/components/admin/AdminToolbar";
import type { AccountStatus } from "@/lib/db/models/User";

const PAGE_SIZE = 25;

const TABS: { value: AccountStatus | "all"; label: string }[] = [
  { value: "pending_review", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const STATUS_TONE: Record<AccountStatus, AdminBadgeTone> = {
  pending_review: "amber",
  approved: "green",
  rejected: "red",
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

  const exportParams = new URLSearchParams();
  exportParams.set("status", status);
  if (sp.q) exportParams.set("q", sp.q);

  return (
    <div className="flex h-full flex-col">
      <AdminPageHeader title="Customers" subtitle="Wholesale account applications">
        <AdminHeaderSearch action="/admin/customers" defaultValue={sp.q} placeholder="Search business, contact, or email…">
          <input type="hidden" name="status" value={status} />
        </AdminHeaderSearch>
        <AdminHeaderGhostLink href={`/api/admin/export/customers?${exportParams.toString()}`}>
          ⬇ Export
        </AdminHeaderGhostLink>
      </AdminPageHeader>

      <div className="flex-1 overflow-y-auto p-5">
        <AdminToolbar>
          {TABS.map((tab) => (
            <AdminChipLink key={tab.value} active={status === tab.value} href={tabHref(tab.value)}>
              {tab.label}
            </AdminChipLink>
          ))}
          <AdminToolbarSpacer />
          <AdminCountBadge>{total} accounts</AdminCountBadge>
        </AdminToolbar>

        <AdminTableCard>
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="bg-[#f0ede9]">
                {["Business", "Contact", "City", "Type", "Est. Volume", "Applied", "Status"].map((h) => (
                  <th key={h} className="px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase">
                    {h}
                  </th>
                ))}
                <th className="w-32 px-2.5 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-[#e4e1dc] last:border-0 hover:bg-[#fff5f4] ${
                    i % 2 === 1 ? "bg-[#faf9f7]" : "bg-white"
                  }`}
                >
                  <td className="px-2.5 py-1.5 font-semibold text-[#1a1816]">{c.businessName || "—"}</td>
                  <td className="px-2.5 py-1.5 text-[#5a5450]">
                    <div>{c.contactName || "—"}</div>
                    <div className="text-[12px] text-[#9a9490]">{c.email}</div>
                    {c.phone && <div className="text-[12px] text-[#9a9490]">{c.phone}</div>}
                  </td>
                  <td className="px-2.5 py-1.5 text-[#5a5450]">{c.city || "—"}</td>
                  <td className="px-2.5 py-1.5 text-[#5a5450] capitalize">{c.businessType || "—"}</td>
                  <td className="px-2.5 py-1.5 text-[#5a5450]">
                    {c.monthlyVolume ? MONTHLY_VOLUME_LABEL[c.monthlyVolume] ?? c.monthlyVolume : "—"}
                  </td>
                  <td className="px-2.5 py-1.5 text-[#9a9490]">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-2.5 py-1.5">
                    <AdminBadge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</AdminBadge>
                  </td>
                  <td className="px-2.5 py-1.5">
                    <CustomerStatusActions customerId={c.id} businessName={c.businessName} status={c.status} />
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#9a9490]">
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
