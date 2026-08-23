import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { adminProductUpdateSchema } from "@/lib/validation/adminProducts";
import {
  listVariantsForProduct,
  getVariantFacets,
} from "@/lib/db/queries/adminVariants";
import { getPricingForProduct } from "@/lib/db/queries/adminPricing";
import { getAdminProductCategories } from "@/lib/db/queries/adminProducts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const productId = Number(id);
  const product = await WdhProduct.findByPk(productId);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const [variants, pricing, facets, categories, supplierRows] = await Promise.all([
    listVariantsForProduct(productId),
    getPricingForProduct(productId),
    getVariantFacets(),
    getAdminProductCategories(),
    WdhSupplier.findAll({ order: [["sortOrder", "ASC"]] }),
  ]);
  const suppliers = supplierRows.map((s) => ({ id: s.id, name: s.name }));

  return NextResponse.json({ product, variants, pricing, facets, categories, suppliers });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const product = await WdhProduct.findByPk(Number(id));
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const body = await request.json();
  const parsed = adminProductUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await product.update(parsed.data);
  return NextResponse.json({ product });
}
