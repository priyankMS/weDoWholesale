import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { User } from "@/lib/db/models/User";
import { verifyPasswordWithUpgrade, hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// A precomputed bcrypt hash with no matching password. Compared against
// when the account doesn't exist, so bcrypt's ~100ms cost runs either way —
// otherwise "unknown email" replies instantly while "wrong password" replies
// slowly, letting an attacker enumerate registered emails via timing.
const DUMMY_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEeO2Q6QW.hJfz8m1mZ8i6zH5v6b1r7cG0G";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ where: { email } });

  if (user?.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    return NextResponse.json(
      {
        error:
          "Too many failed attempts. Try again in a few minutes, or reset your password.",
      },
      { status: 429 },
    );
  }

  const { valid: passwordOk, needsUpgrade } = await verifyPasswordWithUpgrade(
    password,
    user?.passwordHash ?? DUMMY_HASH,
  );

  // Accounts disabled from the existing retail-site admin (isActive) are
  // rejected the same generic way as a wrong password — a distinct message
  // here would let someone probe which emails belong to disabled accounts.
  if (!user || !passwordOk || !user.isActive) {
    if (user) {
      const attempts = user.failedLoginAttempts + 1;
      await user.update({
        failedLoginAttempts: attempts,
        lockedUntil:
          attempts >= MAX_FAILED_ATTEMPTS
            ? new Date(Date.now() + LOCKOUT_MS)
            : null,
      });
    }
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 },
    );
  }

  const updates: Partial<{
    failedLoginAttempts: number;
    lockedUntil: null;
    passwordHash: string;
  }> = {};
  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    updates.failedLoginAttempts = 0;
    updates.lockedUntil = null;
  }
  // Transparent upgrade: this account's password was still on the legacy
  // unsalted-MD5 hash inherited from the retail site — now that we've
  // verified it, replace it with a bcrypt hash so it never has to be
  // checked against MD5 again.
  if (needsUpgrade) {
    updates.passwordHash = await hashPassword(password);
  }
  if (Object.keys(updates).length > 0) {
    await user.update(updates);
  }

  await createSession({
    userId: user.id,
    status: user.status,
    tokenVersion: user.tokenVersion,
  });

  return NextResponse.json({ status: user.status });
}
