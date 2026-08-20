// Email 40 — Password reset (phase7-emails.html #email-pw-reset).
// Wired into app/api/auth/forgot-password/route.ts — the one real,
// customer-facing send call site this phase needed to touch.
import { emailLayout } from "@/lib/email/layout";
import { infoBox, divider } from "@/lib/email/components";
import { emailBaseUrl } from "@/lib/email/theme";

export type PasswordResetEmailParams = {
  email: string;
  token: string;
  expiresInLabel?: string;
  generatedAtLabel: string;
};

export function passwordResetEmail(
  params: PasswordResetEmailParams,
): { subject: string; html: string; text: string } {
  const { email, token, expiresInLabel = "1 hour", generatedAtLabel } = params;
  const resetUrl = `${emailBaseUrl()}/reset-password?token=${token}`;

  const body = `
    <div style="font-size:15px;font-weight:700;color:#1c1714;margin-bottom:12px;">Hi there,</div>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">We received a request to reset the password for your WeDoHalal wholesale account (<strong style="color:#1c1714;">${email}</strong>). Click the button below to set a new password.</p>

    <div style="background:#f8f7f6;border:2px solid #dedad4;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
      <div style="font-size:11px;font-weight:800;color:#8a8480;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:8px;">Reset your password</div>
      <a href="${resetUrl}" style="display:inline-block;background:#d94030;color:#ffffff;padding:14px 32px;border-radius:10px;font-family:'Manrope',Arial,sans-serif;font-size:15px;font-weight:800;text-decoration:none;">Set new password →</a>
      <div style="font-size:12px;color:#8a8480;margin-top:10px;">This link expires in <strong>${expiresInLabel}</strong>.<br>Generated ${generatedAtLabel}.</div>
    </div>

    ${infoBox("🔒", `If you did not request a password reset, ignore this email. Your password will remain unchanged and your account is secure. Do not share this link with anyone.`, "pink")}

    ${divider()}

    <p style="font-size:12.5px;color:#5a524e;margin:0 0 8px;">If the button above does not work, copy and paste this link into your browser:</p>
    <div style="background:#f0eeec;border-radius:8px;padding:10px 12px;margin:0 0 14px;font-size:11.5px;color:#1a5a90;font-weight:600;word-break:break-all;">${resetUrl}</div>

    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">If you have trouble accessing your account, message us on WhatsApp at +1 (780) 722-7623 and we'll help you regain access manually.</p>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0;">The WeDoHalal Team</p>
  `;

  const html = emailLayout({
    previewText: `Reset your WeDoHalal wholesale password — this link expires in ${expiresInLabel}.`,
    headerBg: "#3a3330",
    eyebrow: "Account security",
    title: "Password reset requested",
    bodyHtml: body,
    footerLinks: [
      { label: "Portal", href: `${emailBaseUrl()}/login` },
      { label: "Privacy Policy", href: `${emailBaseUrl()}/privacy` },
      { label: "Contact", href: "https://wa.me/17807227623" },
    ],
    footerNote: "This is a transactional security email and cannot be unsubscribed from.",
  });

  return {
    subject: "Reset your WeDoHalal wholesale password",
    html,
    text: `We received a request to reset the password for ${email}.\n\nReset it here (expires in ${expiresInLabel}): ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.\n\nThe WeDoHalal Team`,
  };
}
