import { randomBytes } from "crypto";
import { Op } from "sequelize";
import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { User } from "@/lib/db/models/User";
import { PasswordReset } from "@/lib/db/models/PasswordReset";
import { sha256Hex } from "@/lib/auth/hash";
import { sendEmail } from "@/lib/email/send";
import { passwordResetEmail } from "@/lib/email/templates";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await User.findOne({ where: { email: parsed.data.email } });

  // Always respond success, whether or not the account exists, so we don't
  // leak which emails are registered.
  if (user) {
    const recent = await PasswordReset.findOne({
      where: {
        userId: user.id,
        usedAt: null,
        createdAt: { [Op.gt]: new Date(Date.now() - RESEND_COOLDOWN_MS) },
      },
      order: [["createdAt", "DESC"]],
    });

    // Prevents a single click-happy user (or an attacker email-bombing a
    // victim) from flooding their inbox with reset links.
    if (!recent) {
      const token = randomBytes(32).toString("hex");
      await PasswordReset.create({
        userId: user.id,
        tokenHash: sha256Hex(token),
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      });

      const { subject, html, text } = passwordResetEmail({
        email: user.email,
        token,
        generatedAtLabel: new Date().toLocaleString("en-CA", {
          dateStyle: "long",
          timeStyle: "short",
          timeZone: "America/Edmonton",
        }),
      });
      await sendEmail({ to: user.email, subject, html, text });
    }
  }

  return NextResponse.json({ ok: true });
}
