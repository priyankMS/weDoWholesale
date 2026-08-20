import { notFound } from "next/navigation";
import Link from "next/link";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { AdminProductForm } from "@/components/admin/AdminProductForm";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await WdhProduct.findByPk(Number(id));
  if (!product) notFound();

  return (
    <div className="p-6">
      <div className="mb-5">
        <Link href="/admin/products" className="text-[0.8rem] font-bold text-red-600">
          ← Back to Products
        </Link>
        <h1 className="mt-2 font-serif text-xl font-black text-neutral-900">{product.item}</h1>
        <p className="text-[0.82rem] text-neutral-500">SKU: {product.sku || "—"}</p>
      </div>

      <AdminProductForm
        productId={product.id}
        defaultValues={{
          item: product.item,
          category: product.category,
          type: product.type,
          sku: product.sku,
          shortDesc: product.shortDesc,
          longDesc1: product.longDesc1,
          metaTitle: product.metaTitle,
          metaDesc: product.metaDesc,
          thumbnailAlt: product.thumbnailAlt,
        }}
      />
    </div>
  );
}
