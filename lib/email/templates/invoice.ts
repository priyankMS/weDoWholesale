// Email 39 — Invoice (phase7-emails.html #email-invoice).
//
// Invoice generation is an admin/billing action (app/api/admin/*), out of
// scope here. Ready to be called with an attached PDF buffer once that
// flow exists — see the `attachments` param on lib/email/send.ts.
import { emailLayout } from "@/lib/email/layout";
import { ctaButton, infoBox, orderCard, sectionLabel } from "@/lib/email/components";
import { emailBaseUrl } from "@/lib/email/theme";
import { formatMoney } from "@/lib/format";

export type InvoiceEmailParams = {
  contactName: string;
  invoiceNumber: string;
  orderNumber: string;
  orderDateLabel: string;
  businessName: string;
  accountId: number;
  subtotal: number;
  gstAmount: number;
  deliveryFeeLabel?: string;
  total: number;
  dueDateLabel: string;
  termsLabel: string;
};

export function invoiceEmail(params: InvoiceEmailParams): { subject: string; html: string; text: string } {
  const {
    contactName,
    invoiceNumber,
    orderNumber,
    orderDateLabel,
    businessName,
    accountId,
    subtotal,
    gstAmount,
    deliveryFeeLabel = "Free",
    total,
    dueDateLabel,
    termsLabel,
  } = params;

  const accountRef = `WDH-ACC-${String(accountId).padStart(5, "0")}`;
  const invoicesUrl = `${emailBaseUrl()}/account/invoices`;

  const body = `
    <div style="font-size:15px;font-weight:700;color:#1c1714;margin-bottom:12px;">Hi ${contactName},</div>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">Your invoice for order <strong style="color:#1c1714;">#${orderNumber}</strong> is attached to this email as a PDF. Payment is due within your agreed ${termsLabel} terms.</p>

    <div style="background:#fff8e0;border:1.5px solid #f0d060;border-radius:12px;padding:14px 16px;margin:14px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:top;padding-right:12px;font-size:22px;line-height:1;">📅</td>
        <td style="vertical-align:top;">
          <div style="font-size:13.5px;font-weight:800;color:#1c1714;margin-bottom:3px;">Payment due: ${dueDateLabel}</div>
          <div style="font-size:12px;color:#a07000;font-weight:600;">${termsLabel} terms</div>
        </td>
      </tr></table>
    </div>

    ${orderCard({
      header: { num: invoiceNumber, status: "Unpaid", bg: "#1a5a90" },
      rows: [
        { label: "Order", value: `#${orderNumber} · ${orderDateLabel}` },
        { label: "Business", value: businessName },
        { label: "Account ID", value: accountRef },
        { label: "Subtotal", value: formatMoney(subtotal) },
        { label: "GST (5%)", value: formatMoney(gstAmount) },
        { label: "Delivery", value: deliveryFeeLabel },
      ],
      totalRow: { label: "Total due", value: formatMoney(total) },
    })}

    ${sectionLabel("How to pay")}
    ${orderCard({
      rows: [
        { label: "E-Transfer", value: `payments@wedohalal.com<br><span style="font-size:11px;color:#8a8480;">Use order #${orderNumber} as your message</span>` },
        { label: "Reference", value: invoiceNumber },
      ],
    })}

    ${infoBox("📎", `A PDF copy of this invoice is attached to this email. Save it for your accounting records. You can also download it anytime from the Invoices section of your portal account.`, "blue")}

    ${ctaButton("View invoice in portal →", invoicesUrl, "blue")}

    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:14px 0 0;">If you have any questions about this invoice, reply to this email or contact us at help@wedohalal.com.</p>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:14px 0 0;">The WeDoHalal Billing Team</p>
  `;

  const html = emailLayout({
    previewText: `Invoice ${invoiceNumber} — ${formatMoney(total)} due ${dueDateLabel}.`,
    headerBg: "#1a5a90",
    logoSub: "Wholesale Billing",
    eyebrow: "Invoice",
    title: `${invoiceNumber} · ${formatMoney(total)}`,
    bodyHtml: body,
    footerLinks: [
      { label: "Invoices", href: invoicesUrl },
      { label: "Portal", href: `${emailBaseUrl()}/login` },
      { label: "Contact", href: "https://wa.me/17807227623" },
    ],
    footerNote: "Billing notifications cannot be unsubscribed from. Contact us for queries.",
  });

  return {
    subject: `Invoice ${invoiceNumber} — ${formatMoney(total)} due ${dueDateLabel}`,
    html,
    text: `Hi ${contactName},\n\nInvoice ${invoiceNumber} for order #${orderNumber}: ${formatMoney(total)} due ${dueDateLabel} (${termsLabel}). View it at ${invoicesUrl}.\n\nThe WeDoHalal Billing Team`,
  };
}
