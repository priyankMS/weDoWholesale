import Link from "next/link";
import { listAdminVariants, getVariantFacets } from "@/lib/db/queries/adminVariants";
import { getAdminProductCategories } from "@/lib/db/queries/adminProducts";
import { AdminTableCard } from "@/components/admin/AdminTableCard";
import { StockBadge } from "@/components/admin/StockBadge";
import { ExportLink } from "@/components/admin/ExportLink";

const PAGE_SIZE = 25;

export default async function AdminVariantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; condition?: string; bone?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ variants, total }, categories, facets] = await Promise.all([
    listAdminVariants({
      search: sp.q,
      category: sp.category,
      condition: sp.condition,
      bone: sp.bone,
      page,
      pageSize: PAGE_SIZE,
    }),
    getAdminProductCategories(),
    getVariantFacets(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.category) params.set("category", sp.category);
    if (sp.condition) params.set("condition", sp.condition);
    if (sp.bone) params.set("bone", sp.bone);
    params.set("page", String(p));
    return `/admin/variants?${params.toString()}`;
  }

  const exportParams = new URLSearchParams();
  if (sp.q) exportParams.set("q", sp.q);
  if (sp.category) exportParams.set("category", sp.category);
  if (sp.condition) exportParams.set("condition", sp.condition);
  if (sp.bone) exportParams.set("bone", sp.bone);

  return (
    <div className="p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-xl font-black text-neutral-900">Variants &amp; SKUs</h1>
          <p className="text-[0.9rem] text-neutral-500">{total} variants across all products</p>
        </div>
        <ExportLink href={`/api/admin/export/variants?${exportParams.toString()}`} />
      </div>

      <form className="mb-4 flex flex-wrap items-center gap-2.5" method="get">
        <input
          type="text"
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search by SKU or title…"
          className="min-w-[220px] flex-1 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-[0.84rem] outline-none focus:border-red-500"
        />
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
        <select
          name="condition"
          defaultValue={sp.condition ?? "All"}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[0.84rem] outline-none focus:border-red-500"
        >
          <option value="All">All Conditions</option>
          {facets.conditions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          name="bone"
          defaultValue={sp.bone ?? "All"}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[0.84rem] outline-none focus:border-red-500"
        >
          <option value="All">All Bone Types</option>
          {facets.bones.map((b) => (
            <option key={b} value={b}>
              {b}
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

      <AdminTableCard>
        <table className="w-full text-left text-[0.9rem]">
          <thead>
            <tr className="border-b border-neutral-100 text-[0.78rem] font-bold tracking-wide text-neutral-400 uppercase">
              <th className="px-4 py-2.5">SKU</th>
              <th className="px-4 py-2.5">Parent Product</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Variant</th>
              <th className="px-4 py-2.5">Stock</th>
              <th className="px-4 py-2.5">Price</th>
              <th className="px-4 py-2.5">Supplier</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-2.5 font-mono text-[0.84rem] text-neutral-500">{v.sku || "—"}</td>
                <td className="px-4 py-2.5 font-semibold text-neutral-900">
                  <Link href={`/admin/products/${v.productId}`} className="hover:text-red-600">
                    {v.productName}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-neutral-600">{v.category}</td>
                <td className="px-4 py-2.5 text-neutral-600">{v.label}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <StockBadge state={v.stockState} />
                    <span className="text-neutral-400">{v.stockCount}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 font-semibold text-neutral-900">
                  {v.basePrice != null ? `$${v.basePrice.toFixed(2)}` : "—"}
                </td>
                <td className="px-4 py-2.5 text-neutral-600">
                  {v.supplierNames.length ? v.supplierNames.join(", ") : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/admin/variants/${v.id}`}
                    className="font-bold text-red-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {variants.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-400">
                  No variants found.
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
