import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { adminPricingUpdateSchema } from "@/lib/validation/adminPricing";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const pricing = await WdhVariantPricing.findByPk(Number(id));
  if (!pricing) return NextResponse.json({ error: "Pricing row not found" }, { status: 404 });

  const body = await request.json();
  const parsed = adminPricingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await pricing.update(parsed.data);
  return NextResponse.json({ pricing });
}
