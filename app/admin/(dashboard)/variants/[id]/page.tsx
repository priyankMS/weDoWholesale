import { notFound } from "next/navigation";
import Link from "next/link";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { variantLabel } from "@/lib/format";
import { AdminVariantForm } from "@/components/admin/AdminVariantForm";

export default async function AdminVariantEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const variant = await WdhVariant.findByPk(Number(id), {
    include: [{ model: WdhProduct, attributes: ["id", "item", "category"] }],
  });
  if (!variant) notFound();

  const product = (variant as WdhVariant & { WdhProduct?: WdhProduct }).WdhProduct;

  return (
    <div className="p-6">
      <div className="mb-5">
        <Link href="/admin/variants" className="text-[0.8rem] font-bold text-red-600">
          ← Back to Variants
        </Link>
        <h1 className="mt-2 font-serif text-xl font-black text-neutral-900">
          {product?.item ?? "Variant"} — {variantLabel(variant)}
        </h1>
        <p className="text-[0.82rem] text-neutral-500">SKU: {variant.sku || "—"}</p>
      </div>

      <AdminVariantForm
        variantId={variant.id}
        defaultValues={{
          sku: variant.sku,
          conditionType: variant.conditionType,
          cutType: variant.cutType,
          boneType: variant.boneType,
          skinType: variant.skinType,
          basePrice: variant.basePrice != null ? Number(variant.basePrice) : null,
          stockCount: variant.stockCount,
        }}
      />
    </div>
  );
}
