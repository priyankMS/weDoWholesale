import { randomBytes } from "crypto";
import { Op } from "sequelize";
import { NextResponse } from "next/server";
import { adminForgotPasswordSchema } from "@/lib/validation/admin";
import { AdminUser } from "@/lib/db/models/AdminUser";
import { AdminPasswordReset } from "@/lib/db/models/AdminPasswordReset";
import { sha256Hex } from "@/lib/auth/hash";
import { enqueueEmail } from "@/lib/queue/emailQueue";
import { adminPasswordResetEmail } from "@/lib/email/templates";

// Mirrors app/api/auth/forgot-password/route.ts's flow for the
// wholesale-portal `users` table, scoped to AdminUser instead.
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = adminForgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const admin = await AdminUser.findOne({ where: { email: parsed.data.email } });

  // Always respond success, whether or not the account exists, so we don't
  // leak which emails are registered admins.
  if (admin) {
    const recent = await AdminPasswordReset.findOne({
      where: {
        adminId: admin.id,
        usedAt: null,
        createdAt: { [Op.gt]: new Date(Date.now() - RESEND_COOLDOWN_MS) },
      },
      order: [["createdAt", "DESC"]],
    });

    if (!recent) {
      const token = randomBytes(32).toString("hex");
      await AdminPasswordReset.create({
        adminId: admin.id,
        tokenHash: sha256Hex(token),
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      });

      const { subject, html, text } = adminPasswordResetEmail({
        email: admin.email,
        token,
        generatedAtLabel: new Date().toLocaleString("en-CA", {
          dateStyle: "long",
          timeStyle: "short",
          timeZone: "America/Edmonton",
        }),
      });
      await enqueueEmail({ to: admin.email, subject, html, text });
    }
  }

  return NextResponse.json({ ok: true });
}
