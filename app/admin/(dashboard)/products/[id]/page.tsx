import { notFound } from "next/navigation";
import Link from "next/link";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { listVariantsForProduct } from "@/lib/db/queries/adminVariants";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminTableCard } from "@/components/admin/AdminTableCard";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { StockBadge } from "@/components/admin/StockBadge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

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
    <div className="flex h-full flex-col">
      <AdminPageHeader title={product.item} subtitle={`SKU: ${product.sku || "—"}`} />

      <div className="flex-1 overflow-y-auto p-5">
        <Link href="/admin/products" className="mb-4 inline-block text-[13px] font-bold text-[#e05a4a]">
          ← Back to Products
        </Link>

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

        <div className="mt-6 rounded-md border border-[#e4e1dc] bg-white p-5">
          <div className="mb-4">
            <h2 className="text-[14px] font-extrabold text-[#1a1816]">Variants, Stock &amp; Supplier</h2>
          </div>

          <AdminTableCard>
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="bg-[#f0ede9]">
                  {["SKU", "Variant", "Stock", "Price", "Supplier(s)"].map((h) => (
                    <th key={h} className="px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase">
                      {h}
                    </th>
                  ))}
                  <th className="w-16 px-2.5 py-1.5" />
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr
                    key={v.id}
                    className={`border-b border-[#e4e1dc] last:border-0 hover:bg-[#fff5f4] ${
                      i % 2 === 1 ? "bg-[#faf9f7]" : "bg-white"
                    }`}
                  >
                    <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] text-[14px] text-[#5a5450]">
                      {v.sku || "—"}
                    </td>
                    <td className="px-2.5 py-1.5 text-[#5a5450]">{v.label}</td>
                    <td className="px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <StockBadge state={v.stockState} />
                        <span className="text-[#9a9490]">{v.stockCount}</span>
                      </div>
                    </td>
                    <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] font-bold text-[#c04535]">
                      {v.basePrice != null ? `$${v.basePrice.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-2.5 py-1.5">
                      {v.supplierNames.length ? (
                        <div className="flex flex-wrap gap-1">
                          {v.supplierNames.map((s) => (
                            <AdminBadge key={s} tone="blue" mono>
                              {s.split(" ")[0]}
                            </AdminBadge>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-2.5 py-1.5 text-right">
                      <Link href={`/admin/variants/${v.id}`} className="rounded p-1 text-[15px] hover:bg-[#fdf2f1]" aria-label="Edit">
                        ✏️
                      </Link>
                    </td>
                  </tr>
                ))}
                {variants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#9a9490]">
                      No variants yet — add one to give this product a price and stock state.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </AdminTableCard>
        </div>
      </div>
    </div>
  );
}
