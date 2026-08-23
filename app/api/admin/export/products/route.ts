import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { listAdminProducts } from "@/lib/db/queries/adminProducts";
import { toCsvResponse } from "@/lib/csv/toCsvResponse";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const { products } = await listAdminProducts({ search, category, pageSize: 100_000 });

  const header = [
    "SKU",
    "Product Name",
    "Category",
    "Part/Type",
    "Variants",
    "Supplier(s)",
    "Stock",
    "SEO",
    "Retail Price",
  ];
  const rows = products.map((p) => [
    p.sku,
    p.name,
    p.category,
    p.type,
    p.variantCount,
    p.supplierNames.join("; "),
    p.stockState,
    p.seoComplete ? "Complete" : "Missing",
    p.retailPrice != null ? p.retailPrice.toFixed(2) : "",
  ]);

  return toCsvResponse("products", header, rows);
}
