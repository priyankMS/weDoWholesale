import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { adminVariantUpdateSchema } from "@/lib/validation/adminVariants";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const variant = await WdhVariant.findByPk(Number(id));
  if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

  const body = await request.json();
  const parsed = adminVariantUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await variant.update(parsed.data);
  return NextResponse.json({ variant });
}
