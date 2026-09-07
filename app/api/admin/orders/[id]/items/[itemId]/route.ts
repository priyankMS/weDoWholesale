import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { updateOrderItem } from "@/lib/db/queries/adminOrders";
import { adminUpdateOrderItemSchema } from "@/lib/validation/adminOrders";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id, itemId } = await params;
  const body = await request.json();
  const parsed = adminUpdateOrderItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    await updateOrderItem({ orderId: Number(id), orderItemId: Number(itemId), ...parsed.data });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error) {
      const status = err.message === "Order item not found" ? 404 : 400;
      return NextResponse.json({ error: err.message }, { status });
    }
    throw err;
  }
}
