import { notFound } from "next/navigation";
import Link from "next/link";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { listVariantsForProduct } from "@/lib/db/queries/adminVariants";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminTableCard } from "@/components/admin/AdminTableCard";
import { StockBadge } from "@/components/admin/StockBadge";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await WdhProduct.findByPk(Number(id));
  if (!product) notFound();

  const variants = await listVariantsForProduct(product.id);

  return (
    <div className="p-6">
      <div className="mb-5">
        <Link href="/admin/products" className="text-[0.8rem] font-bold text-red-600">
          ← Back to Products
        </Link>
        <h1 className="mt-2 font-serif text-xl font-black text-neutral-900">{product.item}</h1>
        <p className="text-[0.9rem] text-neutral-500">SKU: {product.sku || "—"}</p>
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

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-[0.9rem] font-extrabold text-neutral-900">
            Variants, Stock &amp; Supplier
          </h2>
        </div>

        <AdminTableCard>
          <table className="w-full text-left text-[0.9rem]">
            <thead>
              <tr className="border-b border-neutral-100 text-[0.78rem] font-bold tracking-wide text-neutral-400 uppercase">
                <th className="px-4 py-2.5">SKU</th>
                <th className="px-4 py-2.5">Variant</th>
                <th className="px-4 py-2.5">Stock</th>
                <th className="px-4 py-2.5">Price</th>
                <th className="px-4 py-2.5">Supplier(s)</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-2.5 font-mono text-[0.84rem] text-neutral-500">
                    {v.sku || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">{v.label}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <StockBadge state={v.stockState} />
                      <span className="text-neutral-400">{v.stockCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-neutral-900">
                    {v.basePrice != null ? `$${v.basePrice.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">
                    {v.supplierNames.length ? v.supplierNames.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`/admin/variants/${v.id}`}
                      className="font-bold text-red-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {variants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                    No variants yet — add one to give this product a price and stock state.
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
