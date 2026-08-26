import { getSupplierCompareData } from "@/lib/db/queries/adminSupplierCompare";
import { getAdminProductCategories } from "@/lib/db/queries/adminProducts";
import { AdminTableCard } from "@/components/admin/AdminTableCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminToolbar, AdminFilterSelect, AdminChipLink, AdminToolbarSpacer, AdminCountBadge } from "@/components/admin/AdminToolbar";

export default async function AdminSupplierComparePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; conflicts?: string }>;
}) {
  const sp = await searchParams;

  const [{ suppliers, rows, sharedCount }, categories] = await Promise.all([
    getSupplierCompareData(sp.category),
    getAdminProductCategories(),
  ]);

  const filteredRows = sp.conflicts === "1" ? rows.filter((r) => r.hasConflict) : rows;

  function toggleConflictsHref() {
    const params = new URLSearchParams();
    if (sp.category) params.set("category", sp.category);
    if (sp.conflicts !== "1") params.set("conflicts", "1");
    return `/admin/supplier-compare?${params.toString()}`;
  }

  return (
    <div className="flex h-full flex-col">
      <AdminPageHeader title="Supplier Price Comparison" />

      <div className="flex-1 overflow-y-auto p-5">
        <form method="get" action="/admin/supplier-compare">
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
            <AdminChipLink active={sp.conflicts === "1"} href={toggleConflictsHref()}>
              Price Conflicts Only
            </AdminChipLink>
            <AdminToolbarSpacer />
            <AdminCountBadge>
              Comparing {suppliers.length} suppliers · {sharedCount} shared products
            </AdminCountBadge>
          </AdminToolbar>
        </form>

        <AdminTableCard>
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="bg-[#f0ede9]">
                <th className="min-w-[200px] px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase">
                  Product / Variant
                </th>
                {suppliers.map((s) => (
                  <th
                    key={s.id}
                    className="min-w-[150px] px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase"
                  >
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <tr
                  key={row.variantId}
                  className={`border-b border-[#e4e1dc] last:border-0 ${
                    row.hasConflict ? "bg-[#fff8e0]" : i % 2 === 1 ? "bg-[#faf9f7]" : "bg-white hover:bg-[#fff5f4]"
                  }`}
                >
                  <td className="bg-[#faf9f7] px-2.5 py-1.5">
                    <div className="font-semibold text-[#1a1816]">{row.productName}</div>
                    <div className="text-[12px] text-[#9a9490]">{row.variantLabel}</div>
                  </td>
                  {suppliers.map((s) => {
                    const price = row.prices.get(s.id);
                    const isCheapest = row.cheapestSupplierId === s.id;
                    const isPriced = price != null;
                    const isHighest =
                      isPriced &&
                      !isCheapest &&
                      Array.from(row.prices.values()).some((p) => p != null && p < (price as number));
                    return (
                      <td
                        key={s.id}
                        className={`px-2.5 py-1.5 ${
                          isCheapest ? "bg-[#e8f7ef]" : isHighest ? "bg-[#fde8e8]" : ""
                        }`}
                      >
                        {price != null ? (
                          <span>
                            <span className="font-[family-name:var(--font-plex-mono)] font-bold text-[#1a1816]">
                              ${price.toFixed(2)}
                            </span>
                            {isCheapest && <span className="ml-1.5 text-[12px] font-bold text-[#1e8a4a]">● Best</span>}
                            {isHighest && <span className="ml-1.5 text-[12px] font-bold text-[#cc2222]">▲ High</span>}
                          </span>
                        ) : (
                          <span className="text-[13px] text-[#c4c0bc]">Not offered</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={suppliers.length + 1} className="px-4 py-8 text-center text-[#9a9490]">
                    No shared products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </AdminTableCard>
      </div>
    </div>
  );
}
