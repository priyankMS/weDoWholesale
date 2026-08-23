import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { listAdminOrders } from "@/lib/db/queries/adminOrders";
import { toCsvResponse } from "@/lib/csv/toCsvResponse";
import type { OrderStatus } from "@/lib/db/models/Order";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") as OrderStatus | null) ?? undefined;

  const { orders } = await listAdminOrders({ status, pageSize: 100_000 });

  const header = [
    "Order Number",
    "Customer",
    "Items",
    "Total",
    "Status",
    "Payment Method",
    "Payment Status",
    "Placed At",
    "Paid At",
    "Delivery Date",
  ];
  const rows = orders.map((o) => [
    o.orderNumber,
    o.customerName,
    o.itemCount,
    o.finalAmount.toFixed(2),
    o.orderStatus ?? "",
    o.paymentMethod ?? "",
    o.paymentStatus,
    new Date(o.createdAt).toISOString(),
    o.paidAt ? new Date(o.paidAt).toISOString() : "",
    o.deliveryDate ?? "",
  ]);

  return toCsvResponse("orders", header, rows);
}
