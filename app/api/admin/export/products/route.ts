import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { listAdminProducts } from "@/lib/db/queries/adminProducts";

function csvCell(value: string | number | null): string {
  const str = value == null ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { products } = await listAdminProducts({ pageSize: 100_000 });

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
    csvCell(p.sku),
    csvCell(p.name),
    csvCell(p.category),
    csvCell(p.type),
    csvCell(p.variantCount),
    csvCell(p.supplierNames.join("; ")),
    csvCell(p.stockState),
    csvCell(p.seoComplete ? "Complete" : "Missing"),
    csvCell(p.retailPrice != null ? p.retailPrice.toFixed(2) : ""),
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wedohalal-products-${date}.csv"`,
    },
  });
}
