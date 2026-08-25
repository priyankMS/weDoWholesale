import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { recordAdminWeightAdjustment } from "@/lib/db/queries/adminOrders";
import { adminWeightAdjustmentSchema } from "@/lib/validation/adminOrders";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = adminWeightAdjustmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const result = await recordAdminWeightAdjustment({
      orderId: Number(id),
      orderItemId: parsed.data.orderItemId,
      actualQuantity: parsed.data.actualQuantity,
      note: parsed.data.note,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "Order item not found") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
