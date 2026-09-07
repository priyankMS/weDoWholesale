import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { Order } from "@/lib/db/models/Order";
import { getOrderInvoiceData } from "@/lib/invoice/data";
import { renderOrderInvoicePdf } from "@/lib/pdf/orderInvoice";
import { renderOrderInvoiceXlsx } from "@/lib/excel/orderInvoice";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { orderNumber } = await params;
  const order = await Order.findOne({ where: { userId: session.userId, orderNumber } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const data = await getOrderInvoiceData(order.id);
  if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const format = new URL(request.url).searchParams.get("format") === "xlsx" ? "xlsx" : "pdf";
  const filename = `wedohalal-invoice-${data.orderNumber}.${format}`;

  if (format === "xlsx") {
    const buffer = await renderOrderInvoiceXlsx(data);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const buffer = await renderOrderInvoicePdf(data);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
