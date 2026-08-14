import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { PasswordReset } from "@/lib/db/models/PasswordReset";
import { User } from "@/lib/db/models/User";
import { hashPassword } from "@/lib/auth/password";
import { sha256Hex } from "@/lib/auth/hash";
import { revokeAllSessionsForUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const reset = await PasswordReset.findOne({
    where: { tokenHash: sha256Hex(token) },
  });

  if (!reset || reset.usedAt || reset.expiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  const user = await User.findByPk(reset.userId);
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  user.passwordHash = await hashPassword(password);
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  await user.save();

  reset.usedAt = new Date();
  await reset.save();

  // Changing the password should sign the user out everywhere else too —
  // any session token issued before this point is now stale.
  await revokeAllSessionsForUser(user.id);

  return NextResponse.json({ ok: true });
}
