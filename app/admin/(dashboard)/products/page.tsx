import Link from "next/link";
import { listAdminProducts, getAdminProductCategories } from "@/lib/db/queries/adminProducts";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { AdminPageHeader, AdminHeaderSearch, AdminHeaderGhostLink, AdminHeaderPrimaryLink } from "@/components/admin/AdminPageHeader";
import {
  AdminToolbar,
  AdminFilterSelect,
  AdminChipLink,
  AdminToolbarSeparator,
  AdminToolbarLabel,
  AdminToolbarSpacer,
  AdminCountBadge,
} from "@/components/admin/AdminToolbar";
import type { StockState } from "@/lib/db/queries/catalogue";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    supplier?: string;
    stock?: StockState;
    onSale?: string;
    seoMissing?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const category = sp.category && sp.category !== "All" ? sp.category : undefined;
  const supplierId = sp.supplier ? Number(sp.supplier) : undefined;

  const [{ products, total }, categories, suppliers] = await Promise.all([
    listAdminProducts({
      search: sp.q,
      category,
      supplierId,
      stock: sp.stock,
      onSale: sp.onSale === "1",
      seoMissing: sp.seoMissing === "1",
      page,
      pageSize: PAGE_SIZE,
    }),
    getAdminProductCategories(),
    WdhSupplier.findAll({ order: [["sortOrder", "ASC"]] }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function baseParams() {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.category) params.set("category", sp.category);
    if (sp.supplier) params.set("supplier", sp.supplier);
    if (sp.stock) params.set("stock", sp.stock);
    if (sp.onSale === "1") params.set("onSale", "1");
    if (sp.seoMissing === "1") params.set("seoMissing", "1");
    return params;
  }

  function pageHref(p: number) {
    const params = baseParams();
    params.set("page", String(p));
    return `/admin/products?${params.toString()}`;
  }

  function chipHref(key: "onSale" | "seoMissing" | "stock", value: string) {
    const params = baseParams();
    const isActive = params.get(key) === value;
    params.delete(key);
    if (!isActive) params.set(key, value);
    params.delete("page");
    return `/admin/products?${params.toString()}`;
  }

  return (
    <div className="flex h-full flex-col">
      <AdminPageHeader title="Product Catalogue">
        <AdminHeaderSearch action="/admin/products" defaultValue={sp.q} placeholder="Search products, SKUs, suppliers…" />
        <AdminHeaderGhostLink href="/api/admin/export/products">⬇ Export</AdminHeaderGhostLink>
        <AdminHeaderPrimaryLink href="/admin/products/new">+ Add Product</AdminHeaderPrimaryLink>
      </AdminPageHeader>

      <div className="flex-1 overflow-y-auto p-5">
        <form method="get" action="/admin/products">
          <input type="hidden" name="q" value={sp.q ?? ""} />
          {sp.supplier && <input type="hidden" name="supplier" value={sp.supplier} />}
          {sp.stock && <input type="hidden" name="stock" value={sp.stock} />}
          {sp.onSale === "1" && <input type="hidden" name="onSale" value="1" />}
          {sp.seoMissing === "1" && <input type="hidden" name="seoMissing" value="1" />}
          <AdminToolbar>
            <AdminFilterSelect name="category" defaultValue={sp.category ?? "All"}>
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </AdminFilterSelect>
            <AdminFilterSelect name="supplier" defaultValue={sp.supplier ?? ""}>
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </AdminFilterSelect>
            <AdminFilterSelect name="stock" defaultValue={sp.stock ?? ""}>
              <option value="">All Stock</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </AdminFilterSelect>
            <button
              type="submit"
              className="rounded-md bg-[#1a1816] px-3 py-1.5 text-[14px] font-semibold text-white hover:bg-[#3a3632]"
            >
              Filter
            </button>
            <AdminToolbarSeparator />
            <AdminToolbarLabel>SEO:</AdminToolbarLabel>
            <AdminChipLink active={sp.seoMissing === "1"} href={chipHref("seoMissing", "1")}>
              Missing
            </AdminChipLink>
            <AdminChipLink active={sp.onSale === "1"} href={chipHref("onSale", "1")}>
              On Sale
            </AdminChipLink>
            <AdminChipLink active={sp.stock === "low"} href={chipHref("stock", "low")}>
              Low Stock
            </AdminChipLink>
            <AdminToolbarSpacer />
            <AdminCountBadge>{total} products</AdminCountBadge>
          </AdminToolbar>
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
