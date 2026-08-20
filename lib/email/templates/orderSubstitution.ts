// Email 38 — Substitution / partial fulfilment notice
// (phase7-emails.html #email-substitution).
//
// Sent when an order line item is substituted before dispatch — that edit
// happens from the admin Orders panel (app/api/admin/orders/[id]), out of
// scope here. Ready to be called from that admin action once it exists.
import { emailLayout } from "@/lib/email/layout";
import { infoBox, orderCard, sectionLabel, waRow } from "@/lib/email/components";
import { emailBaseUrl } from "@/lib/email/theme";
import { formatMoney } from "@/lib/format";

export type OrderSubstitutionParams = {
  contactName: string;
  orderNumber: string;
  deliveryDateLabel: string;
  windowLabel: string;
  replyCutoffLabel: string;
  substitution: {
    icon?: string;
    itemLabel: string;
    wasDescription: string;
    nowDescription: string;
  };
  total: number;
  totalChanged: boolean;
};

export function orderSubstitutionEmail(
  params: OrderSubstitutionParams,
): { subject: string; html: string; text: string } {
  const {
    contactName,
    orderNumber,
    deliveryDateLabel,
    windowLabel,
    replyCutoffLabel,
    substitution,
    total,
    totalChanged,
  } = params;

  const orderUrl = `${emailBaseUrl()}/account/orders/${orderNumber}`;

  const body = `
    <div style="font-size:15px;font-weight:700;color:#1c1714;margin-bottom:12px;">Hi ${contactName},</div>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">We want to give you advance notice of a change to your order <strong style="color:#1c1714;">#${orderNumber}</strong> before it is dispatched. One item needed to be substituted due to stock availability.</p>

    ${infoBox("⚠️", `If you are not happy with this substitution, reply to this email or message us on WhatsApp before <strong>${replyCutoffLabel}</strong> and we will remove the item and adjust your invoice. After this time, the order will proceed as described below.`, "warn")}

    ${sectionLabel("What changed")}
    <div style="background:#fff8e0;border:1.5px solid #f0d060;border-radius:10px;padding:12px 14px;margin:10px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:top;padding-right:10px;font-size:20px;line-height:1;">${substitution.icon ?? "🔁"}</td>
        <td style="vertical-align:top;">
          <div style="display:inline-block;background:#fff8e0;color:#a07000;border:1px solid #f0d060;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:800;margin-bottom:6px;">Substituted</div>
          <div style="font-size:13.5px;font-weight:800;color:#1c1714;margin-bottom:4px;">${substitution.itemLabel}</div>
          <div style="font-size:12.5px;color:#5a524e;margin-bottom:2px;">Was: ${substitution.wasDescription}</div>
          <div style="font-size:12.5px;color:#1f7a45;font-weight:700;">→ Now: ${substitution.nowDescription}</div>
        </td>
      </tr></table>
    </div>

    ${infoBox("✓", `The substitution carries the same halal certification, the same cut, and the same wholesale price. ${totalChanged ? "Your invoice has been updated accordingly." : "No change to your invoice total."}`, "green")}

    ${orderCard({
      rows: [
        { label: "Order", value: `#${orderNumber}` },
        { label: "Delivery", value: `${deliveryDateLabel} · ${windowLabel}` },
        {
          label: "Invoice total",
          value: `<span style="color:#b53328;font-weight:800;">${formatMoney(total)}${totalChanged ? "" : " (unchanged)"}</span>`,
        },
      ],
    })}

    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">All substitutions are logged in your order's revision history — you can view this at any time in the Order Detail screen of your portal account.</p>

    ${waRow(`Questions or concerns? Message us before ${replyCutoffLabel} — <a href="https://wa.me/17807227623" style="color:#1f7a45;font-weight:800;text-decoration:none;">+1 (780) 722-7623</a> — and we'll sort it before dispatch.`)}

    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:14px 0 0;">Thank you for your understanding.</p>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:14px 0 0;">The WeDoHalal Team</p>
  `;

  const html = emailLayout({
    previewText: `One item in order #${orderNumber} has been substituted — reply before ${replyCutoffLabel}.`,
    headerBg: "#9a6d00",
    eyebrow: "Order update",
    title: "One item has been substituted",
    bodyHtml: body,
    footerLinks: [
      { label: "View order", href: orderUrl },
      { label: "Portal", href: `${emailBaseUrl()}/login` },
      { label: "Contact", href: "https://wa.me/17807227623" },
    ],
    footerNote: "Manage notification preferences from your account settings.",
  });

  return {
    subject: `Update on your order #${orderNumber} — one substitution`,
    html,
    text: `Hi ${contactName},\n\nOne item in order #${orderNumber} was substituted: ${substitution.itemLabel}. Was: ${substitution.wasDescription}. Now: ${substitution.nowDescription}. Reply before ${replyCutoffLabel} if you'd like it removed instead.\n\nThe WeDoHalal Team`,
  };
}
