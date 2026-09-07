// Mirrors passwordReset.ts for the Master Admin panel — same one-hour
// single-use token flow, just branded for staff and pointed at
// /admin/reset-password instead of the wholesale-portal page.
import { emailLayout } from "@/lib/email/layout";
import { infoBox, divider } from "@/lib/email/components";
import { emailBaseUrl } from "@/lib/email/theme";

export type AdminPasswordResetEmailParams = {
  email: string;
  token: string;
  expiresInLabel?: string;
  generatedAtLabel: string;
};

export function adminPasswordResetEmail(
  params: AdminPasswordResetEmailParams,
): { subject: string; html: string; text: string } {
  const { email, token, expiresInLabel = "1 hour", generatedAtLabel } = params;
  const resetUrl = `${emailBaseUrl()}/admin/reset-password?token=${token}`;

  const body = `
    <div style="font-size:15px;font-weight:700;color:#1c1714;margin-bottom:12px;">Hi there,</div>
    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0 0 14px;">We received a request to reset the password for the WeDoHalal Master Admin account (<strong style="color:#1c1714;">${email}</strong>). Click the button below to set a new password.</p>

    <div style="background:#f8f7f6;border:2px solid #dedad4;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
      <div style="font-size:11px;font-weight:800;color:#8a8480;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:8px;">Reset your password</div>
      <a href="${resetUrl}" style="display:inline-block;background:#d94030;color:#ffffff;padding:14px 32px;border-radius:10px;font-family:'Manrope',Arial,sans-serif;font-size:15px;font-weight:800;text-decoration:none;">Set new password →</a>
      <div style="font-size:12px;color:#8a8480;margin-top:10px;">This link expires in <strong>${expiresInLabel}</strong>.<br>Generated ${generatedAtLabel}.</div>
    </div>

    ${infoBox("🔒", `If you did not request this, ignore this email — your password stays unchanged. Do not share this link with anyone.`, "pink")}

    ${divider()}

    <p style="font-size:12.5px;color:#5a524e;margin:0 0 8px;">If the button above does not work, copy and paste this link into your browser:</p>
    <div style="background:#f0eeec;border-radius:8px;padding:10px 12px;margin:0 0 14px;font-size:11.5px;color:#1a5a90;font-weight:600;word-break:break-all;">${resetUrl}</div>

    <p style="font-size:13.5px;color:#5a524e;line-height:1.7;margin:0;">The WeDoHalal Team</p>
  `;

  const html = emailLayout({
    previewText: `Reset your WeDoHalal Master Admin password — this link expires in ${expiresInLabel}.`,
    headerBg: "#3a3330",
    eyebrow: "Admin account security",
    title: "Password reset requested",
    bodyHtml: body,
    footerLinks: [{ label: "Admin panel", href: `${emailBaseUrl()}/admin/login` }],
    footerNote: "This is a transactional security email and cannot be unsubscribed from.",
  });

  return {
    subject: "Reset your WeDoHalal Master Admin password",
    html,
    text: `We received a request to reset the Master Admin password for ${email}.\n\nReset it here (expires in ${expiresInLabel}): ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.\n\nThe WeDoHalal Team`,
  };
}
