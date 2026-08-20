// Email 36 — Order confirmation (phase7-emails.html #email-order-confirm).
//
// NOTE: order creation/payment currently lives entirely in the excluded
// checkout surface (app/api/checkout/*, app/(portal)/checkout/*,
// lib/db/queries/orders.ts) which this build is explicitly not allowed to
// touch — see the TODO left in app/api/checkout/stripe-session/route.ts.
// This template is ready to be called with sendEmail(user.email, ...)
// from there (or from the COD order-creation path) once checkout is
// finalized.
import { emailLayout } from "@/lib/email/layout";
import { ctaButton, infoBox, itemsCard, orderCard, sectionLabel, waRow } from "@/lib/email/components";
import { emailBaseUrl } from "@/lib/email/theme";
import { formatMoney } from "@/lib/format";

export type OrderConfirmationLineItem = {
  icon?: string;
  name: string;
  meta: string;
  totalPrice: number;
};

export type OrderConfirmationParams = {
  contactName: string;
  businessName: string;
  orderNumber: string;
  deliveryDateLabel: string;
  windowLabel: string;
  deliveryAddress: string;
  paymentLabel: string;
  items: OrderConfirmationLineItem[];
  subtotal: number;
  gstAmount: number;
  deliveryFeeLabel?: string;
  total: number;
  cancellationCutoffLabel: string;
};

export function orderConfirmationEmail(
  params: OrderConfirmationParams,
): { subject: string; html: string; text: string } {
  const {
    contactName,
    businessName,
    orderNumber,
    deliveryDateLabel,
    windowLabel,
    deliveryAddress,
    paymentLabel,
    items,
    subtotal,
    gstAmount,
    deliveryFeeLabel = "Free",
    total,
    cancellationCutoffLabel,
  } = params;

  const orderUrl = `${emailBaseUrl()}/account/orders/${orderNumber}`;

  const body = `
    <div style="font-size:15px;font-weight:700;color:#1c1714;margin-bottom:12px;">Hi ${contactName},</div>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">Your wholesale order has been received and confirmed. We're preparing your items now. You'll receive a dispatch notification with driver details on the morning of delivery.</p>

    ${orderCard({
      header: { num: `#${orderNumber}`, status: "Confirmed" },
      rows: [
        { label: "Business", value: businessName },
        { label: "Delivery date", value: deliveryDateLabel },
        { label: "Window", value: windowLabel },
        { label: "Delivering to", value: deliveryAddress },
        { label: "Payment", value: paymentLabel },
      ],
    })}

    ${sectionLabel("Items in this order")}
    ${itemsCard(
      items.map((i) => ({
        icon: i.icon ?? "🥩",
        name: i.name,
        meta: i.meta,
        price: formatMoney(i.totalPrice),
      })),
    )}

    ${orderCard({
      rows: [
        { label: "Subtotal", value: formatMoney(subtotal) },
        { label: "GST (5%)", value: formatMoney(gstAmount) },
        { label: "Delivery", value: deliveryFeeLabel },
      ],
      totalRow: { label: "Total due", value: formatMoney(total) },
    })}

    ${infoBox("📋", `This is a binding wholesale order. Cancellation requests must be made before <strong>${cancellationCutoffLabel}</strong>. Contact us immediately via WhatsApp if needed.`, "pink")}

    ${waRow(`Questions about your order? Message <a href="https://wa.me/17807227623" style="color:#1f7a45;font-weight:800;text-decoration:none;">+1 (780) 722-7623</a> and include your order number #${orderNumber}.`)}

    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:14px 0 0;">Thank you for your order, ${contactName}.</p>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:14px 0 0;">The WeDoHalal Team</p>

    ${ctaButton("View order in portal →", orderUrl, "pink")}
  `;

  const html = emailLayout({
    previewText: `Order #${orderNumber} confirmed for ${businessName} — total ${formatMoney(total)}.`,
    eyebrow: "Order confirmed",
    title: "We've received your order",
    bodyHtml: body,
    footerLinks: [
      { label: "View order", href: orderUrl },
      { label: "Portal", href: `${emailBaseUrl()}/login` },
      { label: "Contact", href: "https://wa.me/17807227623" },
    ],
    footerNote: "Manage notification preferences from your account settings.",
  });

  return {
    subject: `Order confirmed — #${orderNumber} · ${businessName}`,
    html,
    text: `Hi ${contactName},\n\nYour order #${orderNumber} is confirmed. Delivery: ${deliveryDateLabel}, ${windowLabel}. Total due: ${formatMoney(total)}.\n\nView it at ${orderUrl}\n\nThe WeDoHalal Team`,
  };
}
