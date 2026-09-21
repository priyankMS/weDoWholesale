import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { createVariant } from "@/lib/db/queries/adminVariants";
import { adminVariantCreateSchema } from "@/lib/validation/adminVariants";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json();
  const parsed = adminVariantCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const variant = await createVariant(parsed.data);
    return NextResponse.json({ variant }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Product not found") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
