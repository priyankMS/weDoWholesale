import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { User } from "@/lib/db/models/User";
import { PasswordReset } from "@/lib/db/models/PasswordReset";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

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
    const token = randomBytes(32).toString("hex");
    await PasswordReset.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    });

    // TODO: wire up an email provider. Logged here for local development.
    console.log(
      `[password-reset] ${user.email} → /reset-password?token=${token}`,
    );
  }

  return NextResponse.json({ ok: true });
}
