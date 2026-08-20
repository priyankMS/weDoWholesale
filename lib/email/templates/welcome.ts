// Email 35 — Welcome / account approved (phase7-emails.html #email-welcome).
// Sent once an admin flips a User's `status` from "pending_review" to
// "approved". That approval action lives entirely in the admin panel
// (app/api/admin/*), which is out of scope for this build — so this
// template has no in-repo call site yet. It's ready to be invoked with
// `sendEmail(...)` the moment the admin-side approval endpoint exists.
import { emailLayout } from "@/lib/email/layout";
import {
  ctaButton,
  divider,
  infoBox,
  keyValueCard,
  sectionLabel,
  stepsList,
  waRow,
  halalBadgeRow,
} from "@/lib/email/components";
import { emailBaseUrl } from "@/lib/email/theme";
import type { BusinessType } from "@/lib/db/models/User";

const BUSINESS_TYPE_LABEL: Record<BusinessType, string> = {
  restaurant: "Restaurant",
  grocery: "Grocery Store",
  mosque: "Mosque / Community",
  catering: "Catering",
};

export type WelcomeEmailParams = {
  contactName: string;
  businessName: string;
  businessType: BusinessType;
  accountId: number;
  deliveryArea?: string;
  minOrderKg?: number;
};

export function welcomeEmail(params: WelcomeEmailParams): { subject: string; html: string; text: string } {
  const {
    contactName,
    businessName,
    businessType,
    accountId,
    deliveryArea = "Edmonton and surrounding",
    minOrderKg = 100,
  } = params;

  const accountRef = `WDH-ACC-${String(accountId).padStart(5, "0")}`;
  const signInUrl = `${emailBaseUrl()}/login`;

  const body = `
    <div style="font-size:15px;font-weight:700;color:#1c1714;margin-bottom:12px;">Assalamu alaikum ${contactName},</div>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">Your wholesale account application for <strong style="color:#1c1714;">${businessName}</strong> has been reviewed and approved. You now have full access to the WeDoHalal wholesale portal — browse our full catalogue, place bulk orders, and manage everything from your account dashboard.</p>

    ${infoBox("✓", `Account approved and fully active. Your payment terms are set to <strong>Invoice on delivery</strong> by default. Contact us to discuss Net 15 or Net 30 if needed.`, "green")}

    ${ctaButton("Sign in to your account →", signInUrl, "pink")}

    ${divider()}

    ${sectionLabel("Your account at a glance")}
    ${keyValueCard([
      { label: "Business", value: businessName },
      { label: "Account ID", value: accountRef },
      { label: "Account type", value: `Wholesale — ${BUSINESS_TYPE_LABEL[businessType]}` },
      { label: "Delivery area", value: deliveryArea },
      { label: "Min. order", value: `${minOrderKg} kg for delivery` },
    ])}

    <div style="margin:6px 0 2px;">
      ${halalBadgeRow(["ISNA Canada", "HMA UK", "IFANCA"])}
    </div>

    ${divider()}

    ${sectionLabel("Getting started")}
    ${stepsList([
      {
        title: "Sign in and browse",
        desc: "Log in with your registered email and password. Browse all categories — beef, lamb, chicken, goat, fish, turkey, and more.",
      },
      {
        title: "Build your first order",
        desc: `Add products to your cart. Minimum ${minOrderKg} kg total for delivery. Select your preferred delivery window and payment method at checkout.`,
      },
      {
        title: "We pack, we deliver",
        desc: "Orders placed before 3 PM are delivered next business day. You'll get a WhatsApp message with your driver's details on the morning of delivery.",
      },
    ])}

    ${waRow(`Questions about your first order? Message us directly on WhatsApp — <a href="https://wa.me/17807227623" style="color:#1f7a45;font-weight:800;text-decoration:none;">+1 (780) 722-7623</a>. We're available 9 AM – 7 PM, 7 days a week.`)}

    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:14px 0 0;">Welcome to the community. We look forward to serving ${businessName}.</p>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:14px 0 0;">The WeDoHalal Team</p>
  `;

  const html = emailLayout({
    previewText: `Your wholesale account for ${businessName} is approved and ready to order.`,
    eyebrow: "Account approved",
    title: `Welcome to WeDoHalal Wholesale, ${contactName}!`,
    bodyHtml: body,
    footerLinks: [
      { label: "Portal", href: signInUrl },
      { label: "Terms & Conditions", href: `${emailBaseUrl()}/terms` },
      { label: "Privacy Policy", href: `${emailBaseUrl()}/privacy` },
      { label: "Contact", href: "https://wa.me/17807227623" },
    ],
    footerNote: "You received this because you registered a wholesale account.",
  });

  return {
    subject: "Your WeDoHalal wholesale account is approved",
    html,
    text: `Assalamu alaikum ${contactName},\n\nYour wholesale account for ${businessName} (${accountRef}) has been approved. Sign in at ${signInUrl} to start ordering.\n\nThe WeDoHalal Team`,
  };
}
