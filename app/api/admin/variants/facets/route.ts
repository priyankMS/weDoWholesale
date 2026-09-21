import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { getVariantFacets } from "@/lib/db/queries/adminVariants";

// Backs AddVariantModal's product-then-attributes flow on the flat
// /admin/variants list — that page has no single product's facets to
// thread down server-side (unlike ProductDetailPanel / products/[id],
// which already fetch them as part of the page/detail load), so the
// client fetches them once when the modal opens.
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const facets = await getVariantFacets();
  return NextResponse.json({ facets });
}
