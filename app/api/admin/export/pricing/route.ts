import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { listAdminPricing } from "@/lib/db/queries/adminPricing";
import { toCsvResponse } from "@/lib/csv/toCsvResponse";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const supplierParam = searchParams.get("supplier");
  const supplierId = supplierParam ? Number(supplierParam) : undefined;

  const { rows: pricingRows } = await listAdminPricing({ category, supplierId, pageSize: 100_000 });

  const header = [
    "SKU",
    "Product",
    "Variant",
    "Supplier",
    "Dealer Price",
    "Markup",
    "Retail Price",
    "Margin %",
  ];
  const rows = pricingRows.map((r) => [
    r.sku ?? "",
    r.productName,
    r.variantLabel,
    r.supplierName ?? "",
    r.dealerPrice != null ? r.dealerPrice.toFixed(2) : "",
    r.priceIncrement != null ? r.priceIncrement.toFixed(2) : "",
    r.retailPrice != null ? r.retailPrice.toFixed(2) : "",
    r.marginPercent != null ? r.marginPercent.toFixed(1) : "",
  ]);

  return toCsvResponse("pricing", header, rows);
}
