import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { addOrderItem } from "@/lib/db/queries/adminOrders";
import { adminAddOrderItemSchema } from "@/lib/validation/adminOrders";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = adminAddOrderItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    await addOrderItem({ orderId: Number(id), ...parsed.data });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
