import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { Order } from "@/lib/db/models/Order";
import { adminOrderStatusSchema } from "@/lib/validation/adminOrders";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const order = await Order.findByPk(Number(id));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const body = await request.json();
  const parsed = adminOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await order.update({ orderStatus: parsed.data.orderStatus });
  return NextResponse.json({ order });
}
