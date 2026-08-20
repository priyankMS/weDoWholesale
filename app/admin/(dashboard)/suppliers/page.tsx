import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { SupplierModal } from "@/components/admin/SupplierModal";
import { AdminTableCard } from "@/components/admin/AdminTableCard";

export default async function AdminSuppliersPage() {
  const [suppliers, pricingRows] = await Promise.all([
    WdhSupplier.findAll({ order: [["sortOrder", "ASC"]] }),
    WdhVariantPricing.findAll({ attributes: ["supplierId", "variantId"] }),
  ]);

  const productCountBySupplier = new Map<number, Set<number>>();
  for (const row of pricingRows) {
    if (row.supplierId == null) continue;
    if (!productCountBySupplier.has(row.supplierId)) {
      productCountBySupplier.set(row.supplierId, new Set());
    }
    productCountBySupplier.get(row.supplierId)!.add(row.variantId);
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-black text-neutral-900">Suppliers</h1>
          <p className="text-[0.82rem] text-neutral-500">{suppliers.length} registered suppliers</p>
        </div>
        <SupplierModal
          trigger={
            <button className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-[0.82rem] font-bold text-white hover:bg-red-700">
              + Add Supplier
            </button>
          }
        />
      </div>

      <AdminTableCard>
        <table className="w-full text-left text-[0.82rem]">
          <thead>
            <tr className="border-b border-neutral-100 text-[0.7rem] font-bold tracking-wide text-neutral-400 uppercase">
              <th className="px-4 py-2.5">Supplier Name</th>
              <th className="px-4 py-2.5">Contact</th>
              <th className="px-4 py-2.5">Phone</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Products</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Payment Terms</th>
              <th className="px-4 py-2.5">Halal Cert</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-2.5 font-semibold text-neutral-900">{s.name}</td>
                <td className="px-4 py-2.5 text-neutral-600">{s.contactName || "—"}</td>
                <td className="px-4 py-2.5 text-neutral-600">{s.phone || "—"}</td>
                <td className="px-4 py-2.5 text-neutral-600">{s.email || "—"}</td>
                <td className="px-4 py-2.5 text-neutral-600">
                  {productCountBySupplier.get(s.id)?.size ?? 0}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${
                      s.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-neutral-600">{s.paymentTerms || "—"}</td>
                <td className="px-4 py-2.5 text-neutral-600">{s.halalCertStatus || "—"}</td>
                <td className="px-4 py-2.5 text-right">
                  <SupplierModal
                    supplier={{
                      id: s.id,
                      name: s.name,
                      contactName: s.contactName,
                      phone: s.phone,
                      email: s.email,
                      paymentTerms: s.paymentTerms,
                      halalCertStatus: s.halalCertStatus,
                      isActive: s.isActive,
                    }}
                    trigger={
                      <button className="cursor-pointer font-bold text-red-600 hover:underline">
                        Edit
                      </button>
                    }
                  />
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-neutral-400">
                  No suppliers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminTableCard>
    </div>
  );
}
