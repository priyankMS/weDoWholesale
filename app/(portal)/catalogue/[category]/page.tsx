import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCategoryNames,
  categoryFromSlug,
  getProductsByCategory,
  CATEGORY_ICONS,
} from "@/lib/db/queries/catalogue";
import { ProductListing } from "@/components/portal/ProductListing";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const categories = await getAllCategoryNames();
  const category = categoryFromSlug(slug, categories);
  if (!category) notFound();

  const { products, parts } = await getProductsByCategory(category);

  return (
    <div>
      <div className="flex items-center gap-2 px-4 pt-4 pb-1 lg:px-0 lg:pt-6">
        <Link href="/catalogue" className="text-[0.88rem] font-bold text-primary-500">
          ← Back
        </Link>
      </div>
      <div className="px-4 pb-1 lg:px-0">
        <div className="font-serif text-[1.25rem] font-black text-neutral-900">
          {CATEGORY_ICONS[category] ?? "🍽"} {category}
        </div>
      </div>
      <ProductListing products={products} parts={parts} />
    </div>
  );
}
