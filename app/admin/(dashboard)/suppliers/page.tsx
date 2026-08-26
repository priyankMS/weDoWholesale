import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { SupplierModal } from "@/components/admin/SupplierModal";
import { AdminTableCard } from "@/components/admin/AdminTableCard";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminPageHeader, AdminHeaderGhostLink } from "@/components/admin/AdminPageHeader";

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
    <div className="flex h-full flex-col">
      <AdminPageHeader title="Suppliers" subtitle={`${suppliers.length} registered suppliers`}>
        <AdminHeaderGhostLink href="/api/admin/export/suppliers">⬇ Export</AdminHeaderGhostLink>
        <SupplierModal
          trigger={
            <button className="cursor-pointer rounded-[5px] bg-[#e05a4a] px-3 py-1.5 text-[14px] font-semibold text-white hover:bg-[#c04535]">
              + Add Supplier
            </button>
          }
        />
      </AdminPageHeader>

      <div className="flex-1 overflow-y-auto p-5">
        <AdminTableCard>
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="bg-[#f0ede9]">
                {["Supplier Name", "Contact", "Phone", "Email", "Products", "Status", "Payment Terms", "Halal Cert"].map(
                  (h) => (
                    <th key={h} className="px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase">
                      {h}
                    </th>
                  ),
                )}
                <th className="w-16 px-2.5 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-[#e4e1dc] last:border-0 hover:bg-[#fff5f4] ${
                    i % 2 === 1 ? "bg-[#faf9f7]" : "bg-white"
                  }`}
                >
                  <td className="px-2.5 py-1.5 font-semibold text-[#1a1816]">{s.name}</td>
                  <td className="px-2.5 py-1.5 text-[#5a5450]">{s.contactName || "—"}</td>
                  <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] text-[13px] text-[#5a5450]">
                    {s.phone || "—"}
                  </td>
                  <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] text-[13px] text-[#5a5450]">
                    {s.email || "—"}
                  </td>
                  <td className="px-2.5 py-1.5 text-[#5a5450]">{productCountBySupplier.get(s.id)?.size ?? 0}</td>
                  <td className="px-2.5 py-1.5">
                    <AdminBadge tone={s.isActive ? "green" : "neutral"}>{s.isActive ? "Active" : "Away"}</AdminBadge>
                  </td>
                  <td className="px-2.5 py-1.5 text-[#5a5450]">{s.paymentTerms || "—"}</td>
                  <td className="px-2.5 py-1.5">
                    {s.halalCertStatus ? <AdminBadge tone="green">{s.halalCertStatus}</AdminBadge> : "—"}
                  </td>
                  <td className="px-2.5 py-1.5 text-right">
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
                        <button className="rounded p-1 text-[15px] hover:bg-[#fdf2f1]" aria-label="Edit">
                          ✏️
                        </button>
                      }
                    />
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[#9a9490]">
                    No suppliers yet.
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
