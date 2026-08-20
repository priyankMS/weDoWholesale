import Link from "next/link";
import { listAdminProducts, getAdminProductCategories } from "@/lib/db/queries/adminProducts";
import { AdminTableCard } from "@/components/admin/AdminTableCard";

const PAGE_SIZE = 20;

function StockBadge({ state }: { state: "in" | "low" | "out" }) {
  const styles = {
    in: "bg-green-100 text-green-700",
    low: "bg-amber-100 text-amber-700",
    out: "bg-red-100 text-red-700",
  } as const;
  const labels = { in: "In stock", low: "Low stock", out: "Out of stock" } as const;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${styles[state]}`}>
      {labels[state]}
    </span>
  );
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const category = sp.category && sp.category !== "All" ? sp.category : undefined;

  const [{ products, total }, categories] = await Promise.all([
    listAdminProducts({ search: sp.q, category, page, pageSize: PAGE_SIZE }),
    getAdminProductCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.category) params.set("category", sp.category);
    params.set("page", String(p));
    return `/admin/products?${params.toString()}`;
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-black text-neutral-900">Products</h1>
          <p className="text-[0.82rem] text-neutral-500">{total} products in catalogue</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-red-600 px-4 py-2.5 text-[0.82rem] font-bold text-white hover:bg-red-700"
        >
          + New Product
        </Link>
      </div>

      <form className="mb-4 flex flex-wrap items-center gap-2.5" method="get">
        <input
          type="text"
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search by name or SKU…"
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
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-[0.82rem] font-bold text-white hover:bg-neutral-800"
        >
          Filter
        </button>
      </form>

      <AdminTableCard>
        <table className="w-full text-left text-[0.82rem]">
          <thead>
            <tr className="border-b border-neutral-100 text-[0.7rem] font-bold tracking-wide text-neutral-400 uppercase">
              <th className="px-4 py-2.5">SKU</th>
              <th className="px-4 py-2.5">Product Name</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Variants</th>
              <th className="px-4 py-2.5">Supplier(s)</th>
              <th className="px-4 py-2.5">Stock</th>
              <th className="px-4 py-2.5">SEO</th>
              <th className="px-4 py-2.5">Retail Price</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-2.5 font-mono text-[0.76rem] text-neutral-500">
                  {p.sku || "—"}
                </td>
                <td className="px-4 py-2.5 font-semibold text-neutral-900">{p.name}</td>
                <td className="px-4 py-2.5 text-neutral-600">{p.category}</td>
                <td className="px-4 py-2.5 text-neutral-600">{p.variantCount}</td>
                <td className="px-4 py-2.5 text-neutral-600">
                  {p.supplierNames.length ? p.supplierNames.join(", ") : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <StockBadge state={p.stockState} />
                </td>
                <td className="px-4 py-2.5">
                  {p.seoComplete ? (
                    <span className="text-green-600">✓ Complete</span>
                  ) : (
                    <span className="text-amber-600">⚠ Missing</span>
                  )}
                </td>
                <td className="px-4 py-2.5 font-semibold text-neutral-900">
                  {p.retailPrice != null ? `$${p.retailPrice.toFixed(2)}` : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="font-bold text-red-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
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
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`rounded-lg px-3 py-1.5 text-[0.8rem] font-bold ${
                p === page
                  ? "bg-red-600 text-white"
                  : "bg-white text-neutral-600 hover:bg-neutral-100"
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
