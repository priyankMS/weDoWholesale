import nodemailer, { type Transporter } from "nodemailer";

// Generic outbound-mail sender for every template in
// lib/email/templates/*. Mirrors lib/stripe.ts's lazy-init pattern (built
// on first use, not at module load) so the app still boots without SMTP
// credentials configured — matching the pre-existing behaviour in
// app/api/auth/forgot-password/route.ts, which only ever console.logged
// the reset link locally. When SMTP_HOST isn't set, sendEmail falls back
// to that same console.log so local dev keeps working without any setup.
export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

let cachedTransporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (cachedTransporter !== undefined) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  if (!host) {
    cachedTransporter = null;
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  return cachedTransporter;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const from = input.from ?? process.env.EMAIL_FROM ?? "WeDoHalal <help@wedohalal.com>";
  const transporter = getTransporter();

  if (!transporter) {
    // No SMTP_HOST configured — log instead of failing so registration,
    // password reset, etc. keep working in local dev without any mail
    // provider set up.
    console.log(
      `[email] SMTP not configured — would send "${input.subject}" to ${input.to}\n${input.text ?? "(no plain-text body)"}`,
    );
    return;
  }

  await transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}
