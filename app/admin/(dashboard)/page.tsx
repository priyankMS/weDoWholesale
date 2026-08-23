import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/db/queries/adminDashboard";
import { getSupplierCompareData } from "@/lib/db/queries/adminSupplierCompare";

function KpiCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string | number;
  sub: string;
  tone?: "pink" | "green";
}) {
  return (
    <div className="rounded-md border border-[#e4e1dc] bg-white px-3.5 py-3">
      <div className="mb-1 text-[13px] font-semibold tracking-wide text-[#9a9490] uppercase">
        {label}
      </div>
      <div
        className={`font-[family-name:var(--font-plex-mono)] text-[21px] leading-none font-semibold ${
          tone === "pink" ? "text-[#e05a4a]" : tone === "green" ? "text-[#1e8a4a]" : "text-[#1a1816]"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[13px] text-[#9a9490]">{sub}</div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [stats, compare] = await Promise.all([
    getAdminDashboardStats(),
    getSupplierCompareData(),
  ]);
  const conflicts = compare.rows.filter((r) => r.hasConflict);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center gap-3.5 bg-[#141312] px-5">
        <div className="font-[family-name:var(--font-plex-mono)] text-[14px] font-semibold text-white">
          Dashboard
        </div>
        <div className="text-[13px] text-[#5a5450]">WeDoHalal Master Control</div>
        <div className="flex-1" />
        <form action="/admin/products" method="GET" className="flex items-center gap-1.5">
          <input
            type="text"
            name="q"
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
          href="/admin/products"
          className="rounded-[5px] bg-[#e05a4a] px-3 py-1.5 text-[14px] font-semibold text-white hover:bg-[#c04535]"
        >
          + Add Product
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
          <KpiCard label="Total Products" value={stats.totalProducts} sub="Across all categories" />
          <KpiCard label="Total Variants" value={stats.totalVariants} sub="Across all suppliers" />
          <KpiCard
            label="Active Suppliers"
            value={stats.activeSuppliers}
            sub={`of ${stats.totalSuppliers} total`}
            tone="pink"
          />
          <KpiCard
            label="Live Orders"
            value={stats.liveOrders}
            sub="Pending, new, shipped"
            tone="green"
          />
          <KpiCard
            label="Missing SEO"
            value={stats.missingSeo}
            sub="Need meta description"
            tone="pink"
          />
          <KpiCard
            label="Price Conflicts"
            value={conflicts.length}
            sub="Supplier price spread > $1"
            tone="pink"
          />
        </div>

        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          <div className="overflow-hidden rounded-md border border-[#e4e1dc] bg-white">
            <div className="flex items-center justify-between border-b border-[#e4e1dc] px-3.5 py-2.5">
              <div className="text-[14px] font-bold text-[#1a1816]">Supplier Status</div>
              <Link
                href="/admin/suppliers"
                className="text-[14px] font-semibold text-[#e05a4a]"
              >
                Manage →
              </Link>
            </div>
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="bg-[#f0ede9]">
                  <th className="px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase">
                    Supplier
                  </th>
                  <th className="px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase">
                    Priced Variants
                  </th>
                  <th className="px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.supplierStatus.map((s) => (
                  <tr key={s.id} className="border-b border-[#e4e1dc] last:border-0">
                    <td className="px-2.5 py-1.5">
                      <span
                        className={`mr-1.5 inline-block h-[7px] w-[7px] rounded-full ${
                          s.isActive ? "bg-[#1e8a4a]" : "bg-[#c4c0bc]"
                        }`}
                      />
                      {s.name}
                    </td>
                    <td className="px-2.5 py-1.5 text-[#5a5450]">{s.productCount}</td>
                    <td className="px-2.5 py-1.5">
                      <span
                        className={`rounded-[3px] px-1.5 py-px text-[13px] font-bold ${
                          s.isActive
                            ? "bg-[#e8f7ef] text-[#1e8a4a]"
                            : "bg-[#f0ede9] text-[#8a8480]"
                        }`}
                      >
                        {s.isActive ? "Active" : "Away"}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.supplierStatus.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-2.5 py-6 text-center text-[#9a9490]">
                      No suppliers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="overflow-hidden rounded-md border border-[#e4e1dc] bg-white">
            <div className="flex items-center justify-between border-b border-[#e4e1dc] px-3.5 py-2.5">
              <div className="text-[14px] font-bold text-[#1a1816]">
                ⚠️ Price Conflicts ({conflicts.length})
              </div>
              <Link href="/admin/supplier-compare" className="text-[14px] font-semibold text-[#e05a4a]">
                Fix All →
              </Link>
            </div>
            <div>
              {conflicts.slice(0, 5).map((row) => {
                const prices = Array.from(row.prices.values()).filter(
                  (p): p is number => p != null && p > 0,
                );
                const spread = Math.max(...prices) - Math.min(...prices);
                return (
                  <div
                    key={row.variantId}
                    className="flex items-center gap-2.5 border-b border-[#e4e1dc] px-3.5 py-2 text-[14px] last:border-0"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e05a4a]" />
                    <span className="flex-1 text-[#5a5450]">
                      <strong className="font-semibold text-[#1a1816]">{row.productName}</strong>{" "}
                      {row.variantLabel} — suppliers differ by ${spread.toFixed(2)}
                    </span>
                  </div>
                );
              })}
              {conflicts.length === 0 && (
                <div className="px-3.5 py-3 text-[14px] text-[#9a9490]">
                  No supplier price conflicts right now. ✓
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-[#e4e1dc] bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b border-[#e4e1dc] px-3.5 py-2.5">
              <div className="text-[14px] font-bold text-[#1a1816]">
                🔍 SEO Issues ({stats.missingSeo})
              </div>
              <Link href="/admin/seo" className="text-[14px] font-semibold text-[#e05a4a]">
                Fix All →
              </Link>
            </div>
            <div className="px-3.5 py-3">
              {stats.missingSeo > 0 ? (
                <div className="flex items-center gap-2.5 text-[14px]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e05a4a]" />
                  <span className="text-[#5a5450]">
                    <strong className="font-semibold text-[#1a1816]">
                      {stats.missingSeo} products
                    </strong>{" "}
                    missing a meta description
                  </span>
                </div>
              ) : (
                <div className="text-[14px] text-[#9a9490]">
                  All products have a meta description. ✓
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
