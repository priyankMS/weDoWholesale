import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { getSupplierCompareData } from "@/lib/db/queries/adminSupplierCompare";
import { toCsvResponse } from "@/lib/csv/toCsvResponse";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const conflictsOnly = searchParams.get("conflicts") === "1";

  const { suppliers, rows: compareRows } = await getSupplierCompareData(category);
  const filteredRows = conflictsOnly ? compareRows.filter((r) => r.hasConflict) : compareRows;

  const header = ["Product", "Variant", "Category", ...suppliers.map((s) => s.name), "Cheapest Supplier"];
  const rows = filteredRows.map((r) => [
    r.productName,
    r.variantLabel,
    r.category,
    ...suppliers.map((s) => {
      const price = r.prices.get(s.id);
      return price != null ? price.toFixed(2) : "";
    }),
    suppliers.find((s) => s.id === r.cheapestSupplierId)?.name ?? "",
  ]);

  return toCsvResponse("supplier-compare", header, rows);
}
