// Email 41 — Low stock alert / opt-in (phase7-emails.html #email-low-stock).
//
// Would be triggered by an inventory-level cron/admin job
// (app/api/admin/products, stock thresholds) — out of scope for this
// build. NotificationPreference already models the opt-in for this via
// `waLowStock` (WhatsApp); an `emailLowStock` column would need adding to
// that table before this can be wired to a real send, which is left for
// whichever future phase implements the low-stock job itself.
import { emailLayout } from "@/lib/email/layout";
import { ctaButton, divider, infoBox, itemsCard } from "@/lib/email/components";
import { emailBaseUrl } from "@/lib/email/theme";

export type LowStockItem = {
  icon?: string;
  name: string;
  meta: string;
  priceLabel: string;
};

export type LowStockAlertParams = {
  contactName: string;
  businessName: string;
  items: LowStockItem[];
};

export function lowStockAlertEmail(
  params: LowStockAlertParams,
): { subject: string; html: string; text: string } {
  const { contactName, businessName, items } = params;
  const catalogueUrl = `${emailBaseUrl()}/catalogue`;

  const body = `
    <div style="font-size:15px;font-weight:700;color:#1c1714;margin-bottom:12px;">Hi ${contactName},</div>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">We noticed that some products ${businessName} orders regularly are running low. We wanted to give you advance notice so you can plan your next order before stock runs out.</p>

    ${itemsCard(
      items.map((i) => ({
        icon: i.icon ?? "🥩",
        name: i.name,
        meta: i.meta,
        price: i.priceLabel,
        badge: "◐ Low",
      })),
    )}

    ${infoBox("⏰", `Stock levels can change quickly. We cannot guarantee availability beyond the next 48 hours for these items. Add them to your next order to secure your quantity.`, "warn")}

    ${ctaButton("Order now →", catalogueUrl, "pink")}

    ${divider()}

    <p style="font-size:12.5px;color:#8a8480;line-height:1.6;margin:0 0 14px;">You received this alert because you have low stock notifications enabled for products you order regularly. You can turn these off in Notification Preferences in your portal account.</p>

    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0;">The WeDoHalal Team</p>
  `;

  const html = emailLayout({
    previewText: `${items.length} products ${businessName} orders regularly are running low.`,
    headerBg: "#a07000",
    eyebrow: "Stock alert",
    title: "Order soon — limited stock on your regular items",
    bodyHtml: body,
    footerLinks: [
      { label: "Portal", href: `${emailBaseUrl()}/login` },
      { label: "Browse products", href: catalogueUrl },
      { label: "Contact", href: "https://wa.me/17807227623" },
    ],
    footerNote: "Turn off low stock alerts or manage all notifications from your account settings.",
  });

  return {
    subject: `Low stock alert — ${items.length} products you order are running low`,
    html,
    text: `Hi ${contactName},\n\nThese items you order regularly are running low: ${items.map((i) => i.name).join(", ")}. Order soon at ${catalogueUrl}.\n\nThe WeDoHalal Team`,
  };
}
