import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { listAdminVariants } from "@/lib/db/queries/adminVariants";
import { toCsvResponse } from "@/lib/csv/toCsvResponse";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const condition = searchParams.get("condition") ?? undefined;
  const bone = searchParams.get("bone") ?? undefined;

  const { variants } = await listAdminVariants({ search, category, condition, bone, pageSize: 100_000 });

  const header = [
    "SKU",
    "Parent Product",
    "Category",
    "Variant",
    "Stock",
    "Stock State",
    "Price",
    "Supplier(s)",
  ];
  const rows = variants.map((v) => [
    v.sku ?? "",
    v.productName,
    v.category,
    v.label,
    v.stockCount,
    v.stockState,
    v.basePrice != null ? v.basePrice.toFixed(2) : "",
    v.supplierNames.join("; "),
  ]);

  return toCsvResponse("variants", header, rows);
}
