import Link from "next/link";
import { listAdminPricing, listVariantsWithoutPricing } from "@/lib/db/queries/adminPricing";
import { getAdminProductCategories } from "@/lib/db/queries/adminProducts";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { PricingRow } from "@/components/admin/PricingRow";
import { NewPricingRow } from "@/components/admin/NewPricingRow";
import { AdminTableCard } from "@/components/admin/AdminTableCard";

const PAGE_SIZE = 25;

export default async function AdminPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; supplier?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const supplierId = sp.supplier ? Number(sp.supplier) : undefined;

  const [{ rows, total }, categories, suppliers, variantsWithoutPricing] = await Promise.all([
    listAdminPricing({ category: sp.category, supplierId, page, pageSize: PAGE_SIZE }),
    getAdminProductCategories(),
    WdhSupplier.findAll({ order: [["sortOrder", "ASC"]] }),
    listVariantsWithoutPricing(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (sp.category) params.set("category", sp.category);
    if (sp.supplier) params.set("supplier", sp.supplier);
    params.set("page", String(p));
    return `/admin/pricing?${params.toString()}`;
  }

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="font-serif text-xl font-black text-neutral-900">Price Control</h1>
        <p className="text-[0.82rem] text-neutral-500">
          {total} pricing rows · rows highlighted red have margin under 10%
        </p>
      </div>

      <form className="mb-4 flex flex-wrap items-center gap-2.5" method="get">
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
          name="supplier"
          defaultValue={sp.supplier ?? ""}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[0.84rem] outline-none focus:border-red-500"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
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
              <th className="px-4 py-2.5">Product</th>
              <th className="px-4 py-2.5">Variant</th>
              <th className="px-4 py-2.5">Supplier</th>
              <th className="px-4 py-2.5">Dealer Price</th>
              <th className="px-4 py-2.5">Markup $</th>
              <th className="px-4 py-2.5">Retail Price</th>
              <th className="px-4 py-2.5">Margin</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <PricingRow key={row.id} row={row} />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-neutral-400">
                  No pricing rows found.
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

      {variantsWithoutPricing.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-1 font-serif text-lg font-black text-neutral-900">
            Variants without pricing
          </h2>
          <p className="mb-3 text-[0.8rem] text-neutral-500">
            {variantsWithoutPricing.length} variant{variantsWithoutPricing.length !== 1 ? "s" : ""}{" "}
            {variantsWithoutPricing.length !== 1 ? "have" : "has"} no pricing row yet — they won&apos;t
            show a price to customers until one is added.
          </p>
          <AdminTableCard>
            <table className="w-full text-left text-[0.82rem]">
              <thead>
                <tr className="border-b border-neutral-100 text-[0.7rem] font-bold tracking-wide text-neutral-400 uppercase">
                  <th className="px-4 py-2.5">SKU</th>
                  <th className="px-4 py-2.5">Product</th>
                  <th className="px-4 py-2.5">Variant</th>
                  <th className="px-4 py-2.5">Supplier</th>
                  <th className="px-4 py-2.5">Dealer Price</th>
                  <th className="px-4 py-2.5">Markup $</th>
                  <th className="px-4 py-2.5">Retail Price</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {variantsWithoutPricing.map((v) => (
                  <NewPricingRow
                    key={v.variantId}
                    variant={v}
                    suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
                  />
                ))}
              </tbody>
            </table>
          </AdminTableCard>
        </div>
      )}
    </div>
  );
}
