import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { toCsvResponse } from "@/lib/csv/toCsvResponse";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const [suppliers, pricingRows] = await Promise.all([
    WdhSupplier.findAll({ order: [["sortOrder", "ASC"]] }),
    WdhVariantPricing.findAll({ attributes: ["supplierId", "variantId"] }),
  ]);

  const productCountBySupplier = new Map<number, Set<number>>();
  for (const row of pricingRows) {
    if (row.supplierId == null) continue;
    if (!productCountBySupplier.has(row.supplierId)) {
      productCountBySupplier.set(row.supplierId, new Set());
    }
    productCountBySupplier.get(row.supplierId)!.add(row.variantId);
  }

  const header = [
    "Supplier Name",
    "Contact",
    "Phone",
    "Email",
    "Products",
    "Status",
    "Payment Terms",
    "Halal Cert",
  ];
  const rows = suppliers.map((s) => [
    s.name,
    s.contactName ?? "",
    s.phone ?? "",
    s.email ?? "",
    productCountBySupplier.get(s.id)?.size ?? 0,
    s.isActive ? "Active" : "Inactive",
    s.paymentTerms ?? "",
    s.halalCertStatus ?? "",
  ]);

  return toCsvResponse("suppliers", header, rows);
}
