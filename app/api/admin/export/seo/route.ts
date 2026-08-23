import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { listAdminSeoRows } from "@/lib/db/queries/adminSeo";
import { toCsvResponse } from "@/lib/csv/toCsvResponse";
import type { SeoStatus } from "@/lib/db/queries/adminSeo";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const filter = (searchParams.get("filter") as SeoStatus | null) ?? undefined;

  const { rows: seoRows } = await listAdminSeoRows({ category, filter, pageSize: 100_000 });

  const header = [
    "SKU",
    "Product Name",
    "Category",
    "Meta Title",
    "Title Length",
    "Meta Description",
    "Description Length",
    "Has Alt Tag",
    "Status",
    "SEO Score",
  ];
  const rows = seoRows.map((r) => [
    r.sku ?? "",
    r.name,
    r.category,
    r.metaTitle ?? "",
    r.metaTitleLen,
    r.metaDesc ?? "",
    r.metaDescLen,
    r.hasAltTag ? "Yes" : "No",
    r.status,
    r.score,
  ]);

  return toCsvResponse("seo", header, rows);
}
