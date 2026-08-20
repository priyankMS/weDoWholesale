import Link from "next/link";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { AdminProductCreateForm } from "@/components/admin/AdminProductCreateForm";

export default async function AdminProductNewPage() {
  const suppliers = await WdhSupplier.findAll({
    where: { isActive: true },
    order: [["sortOrder", "ASC"]],
    attributes: ["id", "name"],
  });

  return (
    <div className="p-6">
      <div className="mb-5">
        <Link href="/admin/products" className="text-[0.8rem] font-bold text-red-600">
          ← Back to Products
        </Link>
        <h1 className="mt-2 font-serif text-xl font-black text-neutral-900">New Product</h1>
        <p className="text-[0.82rem] text-neutral-500">
          Create a product with its first variant and pricing.
        </p>
      </div>

      <AdminProductCreateForm
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
