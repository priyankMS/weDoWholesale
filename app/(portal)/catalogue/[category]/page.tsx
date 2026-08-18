import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCategoryNames,
  getCategorySummaries,
  categoryFromSlug,
  CATEGORY_ICONS,
} from "@/lib/db/queries/catalogue";
import { ProductListing } from "@/components/portal/ProductListing";

// The product grid itself is fetched client-side (see ProductListing) —
// paginated, filtered and searched against /api/catalogue/products rather
// than shipping the whole category as server-rendered props. This
// server component's job is just the instant shell: validate the slug and
// render the category chrome (breadcrumb, sidebar category list) so the
// page has something on screen before the first API round-trip lands.
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const categoryNames = await getAllCategoryNames();
  const category = categoryFromSlug(slug, categoryNames);
  if (!category) notFound();

  const categories = await getCategorySummaries();

  return (
    <div>
      {/* Mobile back link */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-1 lg:hidden">
        <Link href="/catalogue" className="text-[0.88rem] font-bold text-primary-500">
          ← Back
        </Link>
      </div>

      {/* Desktop breadcrumb */}
      <div className="hidden items-center gap-1.5 pt-6 pb-1 text-[0.78rem] font-semibold text-neutral-400 lg:flex">
        <Link href="/catalogue" className="hover:text-neutral-900">
          Home
        </Link>
        <span>›</span>
        <Link href="/catalogue" className="hover:text-neutral-900">
          Catalogue
        </Link>
        <span>›</span>
        <span className="text-neutral-900">{category}</span>
      </div>

      <div className="px-4 pb-1 lg:px-0">
        <div className="font-serif text-[1.25rem] font-black text-neutral-900">
          {CATEGORY_ICONS[category] ?? "🍽"} {category}
        </div>
      </div>
      <ProductListing category={category} categories={categories} activeSlug={slug} />
    </div>
  );
}
