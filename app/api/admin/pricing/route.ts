import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { createAdminPricing } from "@/lib/db/queries/adminPricing";
import { adminPricingCreateSchema } from "@/lib/validation/adminPricing";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json();
  const parsed = adminPricingCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const variant = await WdhVariant.findByPk(parsed.data.variantId);
  if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

  const pricing = await createAdminPricing(parsed.data);
  return NextResponse.json({ pricing }, { status: 201 });
}
