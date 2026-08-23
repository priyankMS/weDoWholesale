import Link from "next/link";
import { listAdminProducts, getAdminProductCategories } from "@/lib/db/queries/adminProducts";
import { ProductsTable } from "@/components/admin/ProductsTable";

const PAGE_SIZE = 20;

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
    <div className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center gap-3.5 bg-[#141312] px-5">
        <div className="font-[family-name:var(--font-plex-mono)] text-[14px] font-semibold text-white">
          Product Catalogue
        </div>
        <div className="text-[13px] text-[#5a5450]">WeDoHalal Master Control</div>
        <div className="flex-1" />
        <form action="/admin/products" method="GET" className="flex items-center gap-1.5">
          <input
            type="text"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search products, SKUs, suppliers…"
            className="w-56 rounded-md border border-[#2e2c2a] bg-[#1e1c1a] px-2.5 py-1.5 text-[14px] text-[#ccc] outline-none placeholder:text-[#5a5450] focus:border-[#e05a4a]"
          />
        </form>
        <a
          href="/api/admin/export/products"
          className="rounded-[5px] border border-[#3a3632] bg-[#1e1c1a] px-3 py-1.5 text-[14px] font-semibold text-[#aaa] hover:bg-[#2a2724] hover:text-white"
        >
          ⬇ Export
        </a>
        <Link
          href="/admin/products/new"
          className="rounded-[5px] bg-[#e05a4a] px-3 py-1.5 text-[14px] font-semibold text-white hover:bg-[#c04535]"
        >
          + Add Product
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <form
          className="mb-3.5 flex flex-wrap items-center gap-2"
          method="get"
          action="/admin/products"
        >
          <select
            name="category"
            defaultValue={sp.category ?? "All"}
            className="rounded-md border border-[#d0ccc6] bg-white px-2.5 py-1.5 text-[14px] text-[#1a1816] outline-none focus:border-[#e05a4a]"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input type="hidden" name="q" value={sp.q ?? ""} />
          <button
            type="submit"
            className="rounded-md bg-[#1a1816] px-3 py-1.5 text-[14px] font-semibold text-white hover:bg-[#3a3632]"
          >
            Filter
          </button>
          <div className="flex-1" />
          <div className="rounded-[3px] border border-[#e4e1dc] bg-[#f7f5f2] px-2 py-1 font-[family-name:var(--font-plex-mono)] text-[13px] text-[#9a9490]">
            {total} products
          </div>
        </form>

        <ProductsTable products={products} />

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
