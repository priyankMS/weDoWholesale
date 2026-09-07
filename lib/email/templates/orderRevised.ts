// Sent whenever an admin adds, substitutes, or changes the quantity of an
// item on an existing order — replaces orderWeightAdjustment.ts, which
// deliberately never touched the invoice. This one does: the order's
// total/GST/final amount are recalculated (see recomputeOrderTotals in
// lib/db/queries/adminOrders.ts) before this email goes out, so the
// customer is always told the real, current balance — never "this doesn't
// change your invoice".
import { emailLayout } from "@/lib/email/layout";
import { infoBox, orderCard, sectionLabel, waRow } from "@/lib/email/components";
import { emailBaseUrl } from "@/lib/email/theme";
import { formatMoney } from "@/lib/format";

export type OrderRevisedParams = {
  contactName: string;
  orderNumber: string;
  changeSummary: string;
  revisedTotal: number;
  // positive = customer owes more, negative = refund owed to customer
  balanceAdjustment: number;
};

export function orderRevisedEmail(
  params: OrderRevisedParams,
): { subject: string; html: string; text: string } {
  const { contactName, orderNumber, changeSummary, revisedTotal, balanceAdjustment } = params;

  const orderUrl = `${emailBaseUrl()}/account/orders/${orderNumber}`;
  const owesMore = balanceAdjustment > 0;
  const noChange = Math.abs(balanceAdjustment) < 0.005;
  const direction = noChange
    ? "No change to your total"
    : owesMore
      ? `${formatMoney(Math.abs(balanceAdjustment))} due — we'll follow up on how to settle it`
      : `${formatMoney(Math.abs(balanceAdjustment))} owed back to you`;

  const body = `
    <div style="font-size:15px;font-weight:700;color:#1c1714;margin-bottom:12px;">Hi ${contactName},</div>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">Your order <strong style="color:#1c1714;">#${orderNumber}</strong> was just revised by our team.</p>

    ${sectionLabel("What changed")}
    <div style="background:#f8f7f6;border:1.5px solid #e4e1dc;border-radius:10px;padding:12px 14px;margin:10px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:top;padding-right:10px;font-size:20px;line-height:1;">✏️</td>
        <td style="vertical-align:top;">
          <div style="font-size:13.5px;font-weight:700;color:#1c1714;">${changeSummary}</div>
        </td>
      </tr></table>
    </div>

    ${infoBox(noChange ? "✓" : owesMore ? "⚠️" : "✓", direction, noChange ? "green" : owesMore ? "warn" : "green")}

    ${orderCard({
      rows: [
        { label: "Order", value: `#${orderNumber}` },
        { label: "Revised total", value: formatMoney(revisedTotal) },
      ],
    })}

    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">You can view the full original-vs-revised breakdown and download an updated invoice any time from your account.</p>

    ${waRow(`Questions about this revision? Message us on WhatsApp — <a href="https://wa.me/17807227623" style="color:#1f7a45;font-weight:800;text-decoration:none;">+1 (780) 722-7623</a>.`)}

    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:14px 0 0;">The WeDoHalal Team</p>
  `;

  const html = emailLayout({
    previewText: `Order #${orderNumber}: ${changeSummary} — ${direction}`,
    headerBg: "#9a6d00",
    eyebrow: "Order update",
    title: "Your order was revised",
    bodyHtml: body,
    footerLinks: [
      { label: "View order", href: orderUrl },
      { label: "Portal", href: `${emailBaseUrl()}/login` },
      { label: "Contact", href: "https://wa.me/17807227623" },
    ],
    footerNote: "Manage notification preferences from your account settings.",
  });

  return {
    subject: noChange
      ? `Order #${orderNumber} — revised`
      : `Order #${orderNumber} — ${owesMore ? "balance due" : "refund"} after revision`,
    html,
    text: `Hi ${contactName},\n\nYour order #${orderNumber} was revised: ${changeSummary}. Revised total: ${formatMoney(revisedTotal)}. ${direction}.\n\nThe WeDoHalal Team`,
  };
}
