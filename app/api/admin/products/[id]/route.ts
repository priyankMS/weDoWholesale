import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { adminProductUpdateSchema } from "@/lib/validation/adminProducts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const product = await WdhProduct.findByPk(Number(id));
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  return NextResponse.json({ product });
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
