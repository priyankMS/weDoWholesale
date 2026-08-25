// Sent when the admin records the actual delivered/cut weight for an
// order line item against a variable-weight (meat) product, and it
// differs from what was ordered — the wholesale-meat "estimated weight,
// settled at actual weight" pattern already flagged throughout the
// checkout copy ("⚖️ est. weight — adjusted on delivery"). Triggered from
// recordAdminWeightAdjustment() in lib/db/queries/adminOrders.ts.
import { emailLayout } from "@/lib/email/layout";
import { infoBox, orderCard, sectionLabel, waRow } from "@/lib/email/components";
import { emailBaseUrl } from "@/lib/email/theme";
import { formatMoney } from "@/lib/format";

export type OrderWeightAdjustmentParams = {
  contactName: string;
  orderNumber: string;
  itemLabel: string;
  orderedQty: number;
  actualQty: number;
  unit: string;
  unitPrice: number;
  adjustmentAmount: number; // positive = customer owes more, negative = refund owed
  note: string | null;
};

export function orderWeightAdjustmentEmail(
  params: OrderWeightAdjustmentParams,
): { subject: string; html: string; text: string } {
  const {
    contactName,
    orderNumber,
    itemLabel,
    orderedQty,
    actualQty,
    unit,
    unitPrice,
    adjustmentAmount,
    note,
  } = params;

  const orderUrl = `${emailBaseUrl()}/account/orders/${orderNumber}`;
  const owesMore = adjustmentAmount > 0;
  const noAdjustment = Math.abs(adjustmentAmount) < 0.005;
  const direction = noAdjustment
    ? "No change to your invoice"
    : owesMore
      ? `${formatMoney(Math.abs(adjustmentAmount))} due — we'll follow up on how to settle it`
      : `${formatMoney(Math.abs(adjustmentAmount))} owed back to you`;

  const body = `
    <div style="font-size:15px;font-weight:700;color:#1c1714;margin-bottom:12px;">Hi ${contactName},</div>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">Whole cuts don't always land on an exact weight, so wholesale meat orders are invoiced by estimate and settled against what actually gets cut and delivered. Here's the final weight for one item on order <strong style="color:#1c1714;">#${orderNumber}</strong>.</p>

    ${sectionLabel("What was recorded")}
    <div style="background:#f8f7f6;border:1.5px solid #e4e1dc;border-radius:10px;padding:12px 14px;margin:10px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:top;padding-right:10px;font-size:20px;line-height:1;">⚖️</td>
        <td style="vertical-align:top;">
          <div style="font-size:13.5px;font-weight:800;color:#1c1714;margin-bottom:4px;">${itemLabel}</div>
          <div style="font-size:12.5px;color:#5a524e;margin-bottom:2px;">Ordered: ${orderedQty} ${unit}</div>
          <div style="font-size:12.5px;color:#1c1714;font-weight:700;">Actual: ${actualQty} ${unit} @ ${formatMoney(unitPrice)}/${unit}</div>
        </td>
      </tr></table>
    </div>

    ${infoBox(noAdjustment ? "✓" : owesMore ? "⚠️" : "✓", direction, noAdjustment ? "green" : owesMore ? "warn" : "green")}

    ${note ? sectionLabel("Note from our team") + `<p style="font-size:13px;color:#5a524e;line-height:1.6;margin:0 0 14px;">${note}</p>` : ""}

    ${orderCard({
      rows: [
        { label: "Order", value: `#${orderNumber}` },
        { label: "Adjustment", value: noAdjustment ? "None" : `${owesMore ? "+" : "−"}${formatMoney(Math.abs(adjustmentAmount))}` },
      ],
    })}

    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">This is logged in your order's revision history — view it any time in your account.</p>

    ${waRow(`Questions about this adjustment? Message us on WhatsApp — <a href="https://wa.me/17807227623" style="color:#1f7a45;font-weight:800;text-decoration:none;">+1 (780) 722-7623</a>.`)}

    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:14px 0 0;">The WeDoHalal Team</p>
  `;

  const html = emailLayout({
    previewText: `Order #${orderNumber}: final weight recorded for ${itemLabel} — ${direction}`,
    headerBg: "#9a6d00",
    eyebrow: "Order update",
    title: "Final weight recorded",
    bodyHtml: body,
    footerLinks: [
      { label: "View order", href: orderUrl },
      { label: "Portal", href: `${emailBaseUrl()}/login` },
      { label: "Contact", href: "https://wa.me/17807227623" },
    ],
    footerNote: "Manage notification preferences from your account settings.",
  });

  return {
    subject: noAdjustment
      ? `Order #${orderNumber} — final weight confirmed`
      : `Order #${orderNumber} — ${owesMore ? "balance due" : "refund"} from final weight`,
    html,
    text: `Hi ${contactName},\n\nFinal weight for ${itemLabel} on order #${orderNumber}: ordered ${orderedQty}${unit}, actual ${actualQty}${unit}. ${direction}.${note ? `\n\nNote: ${note}` : ""}\n\nThe WeDoHalal Team`,
  };
}
