import Link from "next/link";
import { listAdminPricing, listVariantsWithoutPricing } from "@/lib/db/queries/adminPricing";
import { getAdminProductCategories } from "@/lib/db/queries/adminProducts";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { PricingRow } from "@/components/admin/PricingRow";
import { NewPricingRow } from "@/components/admin/NewPricingRow";
import { AdminTableCard } from "@/components/admin/AdminTableCard";
import { AdminPageHeader, AdminHeaderGhostLink } from "@/components/admin/AdminPageHeader";
import { AdminToolbar, AdminFilterSelect, AdminToolbarSpacer, AdminCountBadge } from "@/components/admin/AdminToolbar";

const PAGE_SIZE = 25;

const PRICING_HEADERS = ["SKU", "Product", "Variant", "Supplier", "Dealer Price", "Markup $", "Retail Price", "Margin"];

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

  const exportParams = new URLSearchParams();
  if (sp.category) exportParams.set("category", sp.category);
  if (sp.supplier) exportParams.set("supplier", sp.supplier);

  return (
    <div className="flex h-full flex-col">
      <AdminPageHeader title="Price Control" subtitle={`${total} pricing rows`}>
        <AdminHeaderGhostLink href={`/api/admin/export/pricing?${exportParams.toString()}`}>
          ⬇ Export
        </AdminHeaderGhostLink>
      </AdminPageHeader>

      <div className="flex-1 overflow-y-auto p-5">
        <form method="get" action="/admin/pricing">
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
            <button
              type="submit"
              className="rounded-md bg-[#1a1816] px-3 py-1.5 text-[14px] font-semibold text-white hover:bg-[#3a3632]"
            >
              Filter
            </button>
            <AdminToolbarSpacer />
            <AdminCountBadge>rows highlighted red have margin under 10%</AdminCountBadge>
          </AdminToolbar>
        </form>

        <AdminTableCard>
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="bg-[#f0ede9]">
                {PRICING_HEADERS.map((h) => (
                  <th key={h} className="px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase">
                    {h}
                  </th>
                ))}
                <th className="w-16 px-2.5 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <PricingRow key={row.id} row={row} index={i} />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[#9a9490]">
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

        {variantsWithoutPricing.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-1 font-[family-name:var(--font-plex-mono)] text-[16px] font-semibold text-[#1a1816]">
              Variants without pricing
            </h2>
            <p className="mb-3 text-[14px] text-[#9a9490]">
              {variantsWithoutPricing.length} variant{variantsWithoutPricing.length !== 1 ? "s" : ""}{" "}
              {variantsWithoutPricing.length !== 1 ? "have" : "has"} no pricing row yet — they won&apos;t
              show a price to customers until one is added.
            </p>
            <AdminTableCard>
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="bg-[#f0ede9]">
                    {["SKU", "Product", "Variant", "Supplier", "Dealer Price", "Markup $", "Retail Price"].map((h) => (
                      <th key={h} className="px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase">
                        {h}
                      </th>
                    ))}
                    <th className="w-16 px-2.5 py-1.5" />
                  </tr>
                </thead>
                <tbody>
                  {variantsWithoutPricing.map((v, i) => (
                    <NewPricingRow
                      key={v.variantId}
                      variant={v}
                      index={i}
                      suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
                    />
                  ))}
                </tbody>
              </table>
            </AdminTableCard>
          </div>
        )}
      </div>
    </div>
  );
}
