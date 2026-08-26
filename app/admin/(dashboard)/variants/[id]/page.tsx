import { notFound } from "next/navigation";
import Link from "next/link";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { variantLabel } from "@/lib/format";
import { AdminVariantForm } from "@/components/admin/AdminVariantForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

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
    <div className="flex h-full flex-col">
      <AdminPageHeader
        title={`${product?.item ?? "Variant"} — ${variantLabel(variant)}`}
        subtitle={`SKU: ${variant.sku || "—"}`}
      />

      <div className="flex-1 overflow-y-auto p-5">
        <Link href="/admin/variants" className="mb-4 inline-block text-[13px] font-bold text-[#e05a4a]">
          ← Back to Variants
        </Link>

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
    </div>
  );
}
