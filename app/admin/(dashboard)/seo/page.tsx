import Link from "next/link";
import { listAdminSeoRows } from "@/lib/db/queries/adminSeo";
import { getAdminProductCategories } from "@/lib/db/queries/adminProducts";
import { SeoInlineEditor } from "@/components/admin/SeoInlineEditor";
import { AdminTableCard } from "@/components/admin/AdminTableCard";

const PAGE_SIZE = 25;

function StatusBadge({ status }: { status: "complete" | "missing" | "warning" }) {
  const styles = {
    complete: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    missing: "bg-red-100 text-red-700",
  } as const;
  const labels = { complete: "Complete", warning: "Warning", missing: "Missing" } as const;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[0.78rem] font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
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

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="font-serif text-xl font-black text-neutral-900">SEO Manager</h1>
        <p className="text-[0.9rem] text-neutral-500">{missingCount} products need attention</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <form method="get" className="flex items-center gap-2.5">
          {sp.filter && <input type="hidden" name="filter" value={sp.filter} />}
          <select
            name="category"
            defaultValue={sp.category ?? "All"}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[0.84rem] outline-none focus:border-red-500"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-[0.9rem] font-bold text-white hover:bg-neutral-800"
          >
            Filter
          </button>
        </form>

        <div className="ml-auto flex gap-1.5">
          {(["All", "Missing", "Warnings", "Complete"] as const).map((label) => {
            const value = label === "All" ? undefined : label === "Warnings" ? "warning" : label.toLowerCase();
            const active = (sp.filter ?? "All") === (value ?? "All");
            return (
              <Link
                key={label}
                href={filterHref(value)}
                className={`rounded-lg px-3 py-1.5 text-[0.86rem] font-bold ${
                  active ? "bg-red-600 text-white" : "bg-white text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <AdminTableCard>
        <table className="w-full text-left text-[0.9rem]">
          <thead>
            <tr className="border-b border-neutral-100 text-[0.78rem] font-bold tracking-wide text-neutral-400 uppercase">
              <th className="px-4 py-2.5">Product / SKU</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Meta Title</th>
              <th className="px-4 py-2.5">Title Len</th>
              <th className="px-4 py-2.5">Meta Description</th>
              <th className="px-4 py-2.5">Desc Len</th>
              <th className="px-4 py-2.5">Alt Tag</th>
              <th className="px-4 py-2.5">SEO Score</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-2.5">
                  <div className="font-semibold text-neutral-900">{r.name}</div>
                  <div className="font-mono text-[0.78rem] text-neutral-400">{r.sku || "—"}</div>
                </td>
                <td className="px-4 py-2.5 text-neutral-600">{r.category}</td>
                <td className="max-w-[220px] truncate px-4 py-2.5 text-neutral-600">
                  {r.metaTitle || <span className="text-red-500">Missing</span>}
                </td>
                <td className="px-4 py-2.5 text-neutral-500">{r.metaTitleLen}</td>
                <td className="max-w-[240px] truncate px-4 py-2.5 text-neutral-600">
                  {r.metaDesc || <span className="text-red-500">Missing</span>}
                </td>
                <td className="px-4 py-2.5 text-neutral-500">{r.metaDescLen}</td>
                <td className="px-4 py-2.5">{r.hasAltTag ? "✓" : "—"}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} />
                    <span className="text-neutral-400">{r.score}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
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
                <td colSpan={9} className="px-4 py-8 text-center text-neutral-400">
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
