import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductDetail } from "@/lib/db/queries/catalogue";
import { ProductDetailClient } from "@/components/portal/ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const detail = await getProductDetail(productId);
  if (!detail) notFound();

  return (
    <div className="pb-28 lg:pb-8">
      <div className="flex items-center gap-2 px-4 pt-4 pb-1 lg:px-0 lg:pt-6">
        <Link
          href={`/catalogue/${detail.summary.categorySlug}`}
          className="text-[0.88rem] font-bold text-primary-500"
        >
          ← Back
        </Link>
      </div>

      <ProductDetailClient
        product={detail.summary}
        shortDesc={detail.shortDesc}
        longDesc={detail.longDesc1}
        sku={detail.sku}
      />
    </div>
  );
}
