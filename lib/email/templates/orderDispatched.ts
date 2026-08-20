// Email 37 — Order dispatched (phase7-emails.html #email-dispatch).
//
// Triggered when order status flips to "shipped" — that transition happens
// from the admin Orders panel (app/api/admin/orders/[id]), which is out of
// scope for this build. Ready to be called from that admin action, or from
// a future driver-assignment flow, whichever lands first.
//
// The desktop mockup pass (phase7-emails-desktop.html) added a "weight
// notice" callout not present in the mobile source — real fresh-meat
// deliveries can vary ±10% from the ordered weight, and the invoice
// reflects the actual delivered weight. That's genuinely new, useful
// information, so it's folded in here as an extra info box.
import { emailLayout } from "@/lib/email/layout";
import { infoBox, keyValueCard, orderCard, waRow } from "@/lib/email/components";
import { emailBaseUrl } from "@/lib/email/theme";
import { formatMoney } from "@/lib/format";

export type OrderDispatchedParams = {
  contactName: string;
  orderNumber: string;
  driverName: string;
  driverPhone: string;
  windowLabel: string;
  deliveryAddress: string;
  total: number;
  itemSummary: string;
  totalWeightKg: number;
};

export function orderDispatchedEmail(
  params: OrderDispatchedParams,
): { subject: string; html: string; text: string } {
  const {
    contactName,
    orderNumber,
    driverName,
    driverPhone,
    windowLabel,
    deliveryAddress,
    total,
    itemSummary,
    totalWeightKg,
  } = params;

  const orderUrl = `${emailBaseUrl()}/account/orders/${orderNumber}`;

  const body = `
    <div style="font-size:15px;font-weight:700;color:#1c1714;margin-bottom:12px;">Hi ${contactName},</div>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">Great news — your order <strong style="color:#1c1714;">#${orderNumber}</strong> has been packed and dispatched. Your driver is on the way now. Here are the details:</p>

    ${keyValueCard([
      { label: "Driver", value: `${driverName} (WeDoHalal)` },
      { label: "Contact", value: `<a href="tel:${driverPhone}" style="color:#d94030;font-weight:700;text-decoration:none;">${driverPhone}</a>` },
      { label: "Window", value: windowLabel },
      { label: "Delivering to", value: deliveryAddress },
      { label: "Total", value: `<span style="font-family:'Fraunces',Georgia,serif;font-size:15px;font-weight:900;color:#b53328;">${formatMoney(total)}</span>` },
    ])}

    ${infoBox("📱", `Please ensure someone is available at the delivery address to receive and inspect the order. Report any issues within <strong>1 hour of delivery</strong> with photos.`, "green")}

    ${infoBox("⚖️", `<strong>Weight notice:</strong> actual weights on fresh meat items may differ by up to ±10% from your order estimate. Your invoice will reflect actual delivered weight.`, "warn")}

    ${orderCard({
      rows: [
        { label: "Order", value: `#${orderNumber} · ${totalWeightKg} kg total` },
        { label: "Items", value: itemSummary },
      ],
    })}

    ${waRow(`Need to reach the driver or report an issue on arrival? Message us on WhatsApp — <a href="https://wa.me/17807227623" style="color:#1f7a45;font-weight:800;text-decoration:none;">+1 (780) 722-7623</a>. Fastest response during delivery hours.`)}

    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:14px 0 0;">Enjoy your delivery, ${contactName}.</p>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:14px 0 0;">The WeDoHalal Team</p>
  `;

  const html = emailLayout({
    previewText: `Order #${orderNumber} is on the way — driver ${driverName}, ${windowLabel}.`,
    headerBg: "#1f7a45",
    eyebrow: "Out for delivery",
    title: "Your order is on the way",
    bodyHtml: body,
    footerLinks: [
      { label: "View order", href: orderUrl },
      { label: "Portal", href: `${emailBaseUrl()}/login` },
      { label: "Contact", href: "https://wa.me/17807227623" },
    ],
    footerNote: "Manage notification preferences from your account settings.",
  });

  return {
    subject: `Your order #${orderNumber} is on the way — driver details inside`,
    html,
    text: `Hi ${contactName},\n\nOrder #${orderNumber} is on its way. Driver: ${driverName} (${driverPhone}). Window: ${windowLabel}. Delivering to: ${deliveryAddress}.\n\nThe WeDoHalal Team`,
  };
}
