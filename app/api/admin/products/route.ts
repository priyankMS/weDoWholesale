import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { createAdminProduct } from "@/lib/db/queries/adminProducts";
import { adminProductCreateSchema } from "@/lib/validation/adminProducts";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json();
  const parsed = adminProductCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { productId } = await createAdminProduct(parsed.data);
  return NextResponse.json({ productId }, { status: 201 });
}
