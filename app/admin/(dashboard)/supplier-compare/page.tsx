import { getSupplierCompareData } from "@/lib/db/queries/adminSupplierCompare";
import { getAdminProductCategories } from "@/lib/db/queries/adminProducts";
import { AdminTableCard } from "@/components/admin/AdminTableCard";

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

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="font-serif text-xl font-black text-neutral-900">Supplier Compare</h1>
        <p className="text-[0.9rem] text-neutral-500">
          Comparing {suppliers.length} suppliers · {sharedCount} shared products
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
        <label className="flex items-center gap-1.5 text-[0.9rem] text-neutral-600">
          <input
            type="checkbox"
            name="conflicts"
            value="1"
            defaultChecked={sp.conflicts === "1"}
            className="h-3.5 w-3.5"
          />
          Price conflicts only
        </label>
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
              <th className="px-4 py-2.5">Product / Variant</th>
              {suppliers.map((s) => (
                <th key={s.id} className="px-4 py-2.5">
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr
                key={row.variantId}
                className={`border-b border-neutral-100 last:border-0 ${row.hasConflict ? "bg-amber-50/60" : "hover:bg-neutral-50"}`}
              >
                <td className="px-4 py-2.5">
                  <div className="font-semibold text-neutral-900">{row.productName}</div>
                  <div className="text-[0.82rem] text-neutral-400">{row.variantLabel}</div>
                </td>
                {suppliers.map((s) => {
                  const price = row.prices.get(s.id);
                  const isCheapest = row.cheapestSupplierId === s.id;
                  return (
                    <td key={s.id} className="px-4 py-2.5">
                      {price != null ? (
                        <span
                          className={`font-semibold ${isCheapest ? "text-green-700" : "text-neutral-700"}`}
                        >
                          ${price.toFixed(2)}
                          {isCheapest && <span className="ml-1 text-[0.78rem]">✓ Cheapest</span>}
                        </span>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={suppliers.length + 1} className="px-4 py-8 text-center text-neutral-400">
                  No shared products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminTableCard>
    </div>
  );
}
