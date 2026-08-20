import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/db/queries/adminDashboard";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="text-[0.7rem] font-bold tracking-wide text-neutral-400 uppercase">
        {label}
      </div>
      <div className="mt-1 font-serif text-2xl font-black text-neutral-900">{value}</div>
      <div className="mt-0.5 text-[0.72rem] text-neutral-500">{sub}</div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-black text-neutral-900">Dashboard</h1>
          <p className="text-[0.82rem] text-neutral-500">WeDoHalal Master Control</p>
        </div>
        <Link
          href="/admin/products"
          className="rounded-lg bg-red-600 px-4 py-2 text-[0.82rem] font-bold text-white hover:bg-red-700"
        >
          + Add Product
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Products" value={stats.totalProducts} sub="Across all categories" />
        <StatCard label="Total Variants" value={stats.totalVariants} sub="Across all suppliers" />
        <StatCard
          label="Active Suppliers"
          value={stats.activeSuppliers}
          sub={`of ${stats.totalSuppliers} total`}
        />
        <StatCard label="Live Orders" value={stats.liveOrders} sub="Pending, new, shipped" />
        <StatCard label="Missing SEO" value={stats.missingSeo} sub="Need meta description" />
        <StatCard label="Suppliers" value={stats.totalSuppliers} sub="Registered in system" />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <div className="text-[0.86rem] font-bold text-neutral-900">Supplier Status</div>
          <Link href="/admin/suppliers" className="text-[0.78rem] font-bold text-red-600">
            Manage →
          </Link>
        </div>
        <table className="w-full text-left text-[0.82rem]">
          <thead>
            <tr className="border-b border-neutral-100 text-[0.7rem] font-bold tracking-wide text-neutral-400 uppercase">
              <th className="px-4 py-2">Supplier</th>
              <th className="px-4 py-2">Priced Variants</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.supplierStatus.map((s) => (
              <tr key={s.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-2.5 font-semibold text-neutral-900">{s.name}</td>
                <td className="px-4 py-2.5 text-neutral-600">{s.productCount}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${
                      s.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
            {stats.supplierStatus.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-neutral-400">
                  No suppliers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
