// Manual "Email invoice" admin action — Email 39 (phase7-emails.html
// #email-invoice). Unlike order confirmation/dispatch (which fire
// automatically off an order-lifecycle event), sending an invoice is
// something an admin explicitly triggers for a specific order, so this
// lives next to the PDF/Excel invoice generation it reuses rather than in
// the automatic notifyOrder*() functions in lib/db/queries/{orders,adminOrders}.ts.
import { Order } from "@/lib/db/models/Order";
import { User } from "@/lib/db/models/User";
import { getOrderInvoiceData } from "@/lib/invoice/data";
import { renderOrderInvoicePdf } from "@/lib/pdf/orderInvoice";
import { invoiceEmail } from "@/lib/email/templates/invoice";
import { getNotificationPreferences } from "@/lib/db/queries/account";
import { formatDate, paymentTermsLabel } from "@/lib/format";
import { enqueueEmail } from "@/lib/queue/emailQueue";

export class InvoiceEmailError extends Error {}

export async function sendInvoiceEmail(orderId: number): Promise<void> {
  const order = await Order.findByPk(orderId, { include: [{ model: User }] });
  const user = (order as (Order & { User?: User }) | null)?.User;
  if (!order || !user?.email) {
    throw new InvoiceEmailError("Order or customer email not found");
  }

  const prefs = await getNotificationPreferences(user.id);
  if (!prefs.emailInvoice) {
    throw new InvoiceEmailError(
      "This customer has turned off invoice emails in their notification preferences",
    );
  }

  const data = await getOrderInvoiceData(orderId);
  if (!data) throw new InvoiceEmailError("Order not found");

  const pdfBuffer = await renderOrderInvoicePdf(data);

  const termsDays = user.paymentTerms === "net30" ? 30 : user.paymentTerms === "net15" ? 15 : null;
  const dueDate = new Date(order.createdAt);
  if (termsDays != null) dueDate.setDate(dueDate.getDate() + termsDays);
  const dueDateLabel =
    order.paymentStatus === "Completed"
      ? "Paid"
      : termsDays != null
        ? formatDate(dueDate)
        : "Due on delivery";

  const { subject, html, text } = invoiceEmail({
    contactName: user.contactName || user.businessName || "there",
    invoiceNumber: `INV-${order.orderNumber}`,
    orderNumber: order.orderNumber,
    orderDateLabel: formatDate(order.createdAt),
    businessName: user.businessName || user.contactName || "your business",
    accountId: user.id,
    subtotal: data.revisedSubtotal,
    gstAmount: data.revisedGst,
    total: data.revisedTotal,
    dueDateLabel,
    termsLabel: paymentTermsLabel(user.paymentTerms),
  });

  const sent = await enqueueEmail({
    to: user.email,
    subject,
    html,
    text,
    attachments: [
      {
        filename: `wedohalal-invoice-${order.orderNumber}.pdf`,
        content: pdfBuffer.toString("base64"),
        contentType: "application/pdf",
      },
    ],
  });
  if (!sent) {
    throw new InvoiceEmailError("Could not send the invoice email — check the server logs for details");
  }
}
