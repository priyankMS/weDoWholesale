import Link from "next/link";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { AdminProductCreateForm } from "@/components/admin/AdminProductCreateForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  getAdminProductCategories,
  getAdminProductTypesByCategory,
} from "@/lib/db/queries/adminProducts";

export default async function AdminProductNewPage() {
  const [suppliers, categories, typesByCategory] = await Promise.all([
    WdhSupplier.findAll({
      where: { isActive: true },
      order: [["sortOrder", "ASC"]],
      attributes: ["id", "name"],
    }),
    getAdminProductCategories(),
    getAdminProductTypesByCategory(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <AdminPageHeader title="New Product" subtitle="Create a product with its first variant and pricing" />

      <div className="flex-1 overflow-y-auto p-5">
        <Link href="/admin/products" className="mb-4 inline-block text-[13px] font-bold text-[#e05a4a]">
          ← Back to Products
        </Link>

        <AdminProductCreateForm
          suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
          categories={categories}
          typesByCategory={typesByCategory}
        />
      </div>
    </div>
  );
}
