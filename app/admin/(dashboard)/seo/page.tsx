import Link from "next/link";
import { listAdminSeoRows } from "@/lib/db/queries/adminSeo";
import { getAdminProductCategories } from "@/lib/db/queries/adminProducts";
import { SeoInlineEditor } from "@/components/admin/SeoInlineEditor";
import { AdminTableCard } from "@/components/admin/AdminTableCard";
import { AdminBadge, type AdminBadgeTone } from "@/components/admin/AdminBadge";
import { AdminPageHeader, AdminHeaderGhostLink } from "@/components/admin/AdminPageHeader";
import {
  AdminToolbar,
  AdminFilterSelect,
  AdminToolbarSeparator,
  AdminChipLink,
  AdminToolbarSpacer,
  AdminCountBadge,
} from "@/components/admin/AdminToolbar";

const PAGE_SIZE = 25;

const STATUS_TONE: Record<"complete" | "missing" | "warning", AdminBadgeTone> = {
  complete: "green",
  warning: "amber",
  missing: "red",
};
const STATUS_LABEL = { complete: "Complete", warning: "Warning", missing: "Missing" } as const;

function SeoStatusBadge({ status }: { status: "complete" | "missing" | "warning" }) {
  return <AdminBadge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</AdminBadge>;
}

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; filter?: "missing" | "complete" | "warning"; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ rows, total, missingCount }, categories] = await Promise.all([
    listAdminSeoRows({ category: sp.category, filter: sp.filter, page, pageSize: PAGE_SIZE }),
    getAdminProductCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (sp.category) params.set("category", sp.category);
    if (sp.filter) params.set("filter", sp.filter);
    params.set("page", String(p));
    return `/admin/seo?${params.toString()}`;
  }

  function filterHref(filter?: string) {
    const params = new URLSearchParams();
    if (sp.category) params.set("category", sp.category);
    if (filter) params.set("filter", filter);
    return `/admin/seo?${params.toString()}`;
  }

  const exportParams = new URLSearchParams();
  if (sp.category) exportParams.set("category", sp.category);
  if (sp.filter) exportParams.set("filter", sp.filter);

  return (
    <div className="flex h-full flex-col">
      <AdminPageHeader title="SEO Manager" subtitle={`${missingCount} products need attention`}>
        <AdminHeaderGhostLink href={`/api/admin/export/seo?${exportParams.toString()}`}>
          ⬇ Export
        </AdminHeaderGhostLink>
      </AdminPageHeader>

      <div className="flex-1 overflow-y-auto p-5">
        <form method="get" action="/admin/seo">
          {sp.filter && <input type="hidden" name="filter" value={sp.filter} />}
          <AdminToolbar>
            <AdminFilterSelect name="category" defaultValue={sp.category ?? "All"}>
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </AdminFilterSelect>
            <button
              type="submit"
              className="rounded-md bg-[#1a1816] px-3 py-1.5 text-[14px] font-semibold text-white hover:bg-[#3a3632]"
            >
              Filter
            </button>
            <AdminToolbarSeparator />
            <AdminChipLink active={!sp.filter} href={filterHref(undefined)}>
              All
            </AdminChipLink>
            <AdminChipLink active={sp.filter === "missing"} href={filterHref("missing")}>
              Missing SEO
            </AdminChipLink>
            <AdminChipLink active={sp.filter === "complete"} href={filterHref("complete")}>
              Complete
            </AdminChipLink>
            <AdminChipLink active={sp.filter === "warning"} href={filterHref("warning")}>
              Warnings
            </AdminChipLink>
            <AdminToolbarSpacer />
            <AdminCountBadge>{missingCount} need attention</AdminCountBadge>
          </AdminToolbar>
        </form>

        <AdminTableCard>
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="bg-[#f0ede9]">
                {["Product / SKU", "Category", "Meta Title", "Title Len", "Meta Description", "Desc Len", "Alt Tag", "SEO Score"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
                <th className="w-16 px-2.5 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-[#e4e1dc] last:border-0 hover:bg-[#fff5f4] ${
                    i % 2 === 1 ? "bg-[#faf9f7]" : "bg-white"
                  }`}
                >
                  <td className="px-2.5 py-1.5">
                    <div className="font-semibold text-[#1a1816]">{r.name}</div>
                    <div className="font-[family-name:var(--font-plex-mono)] text-[12px] text-[#9a9490]">
                      {r.sku || "—"}
                    </div>
                  </td>
                  <td className="px-2.5 py-1.5">
                    <AdminBadge tone="category">{r.category}</AdminBadge>
                  </td>
                  <td className="max-w-[220px] truncate px-2.5 py-1.5 text-[#5a5450]">
                    {r.metaTitle || <span className="text-[#cc2222]">Missing</span>}
                  </td>
                  <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] text-[13px] text-[#9a9490]">
                    {r.metaTitleLen}
                  </td>
                  <td className="max-w-[280px] truncate px-2.5 py-1.5 text-[#5a5450]">
                    {r.metaDesc || <span className="text-[#cc2222]">Missing</span>}
                  </td>
                  <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] text-[13px] text-[#9a9490]">
                    {r.metaDescLen}
                  </td>
                  <td className="px-2.5 py-1.5">
                    {r.hasAltTag ? <span className="text-[#1e8a4a]">✓</span> : <span className="text-[#c4c0bc]">—</span>}
                  </td>
                  <td className="px-2.5 py-1.5">
                    <div className="flex items-center gap-2">
                      <SeoStatusBadge status={r.status} />
                      <span className="font-[family-name:var(--font-plex-mono)] text-[13px] text-[#9a9490]">
                        {r.score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-2.5 py-1.5 text-right">
                    <SeoInlineEditor
                      productId={r.id}
                      productName={r.name}
                      initialMetaTitle={r.metaTitle}
                      initialMetaDesc={r.metaDesc}
                    />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[#9a9490]">
                    No products found.
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
