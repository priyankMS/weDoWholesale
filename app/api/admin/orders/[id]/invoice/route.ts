import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { getOrderInvoiceData } from "@/lib/invoice/data";
import { renderOrderInvoicePdf } from "@/lib/pdf/orderInvoice";
import { renderOrderInvoiceXlsx } from "@/lib/excel/orderInvoice";
import { sendInvoiceEmail, InvoiceEmailError } from "@/lib/invoice/sendInvoiceEmail";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const data = await getOrderInvoiceData(Number(id));
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

// Emails the PDF invoice to the customer (as opposed to GET, which
// downloads it for the admin) — a deliberate, one-off admin action rather
// than something triggered off an order-lifecycle event.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  try {
    await sendInvoiceEmail(Number(id));
  } catch (err) {
    if (err instanceof InvoiceEmailError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
