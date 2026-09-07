import { NextResponse } from "next/server";
import { adminResetPasswordSchema } from "@/lib/validation/admin";
import { AdminPasswordReset } from "@/lib/db/models/AdminPasswordReset";
import { AdminUser } from "@/lib/db/models/AdminUser";
import { hashPassword } from "@/lib/auth/password";
import { sha256Hex } from "@/lib/auth/hash";

// Mirrors app/api/auth/reset-password/route.ts for AdminUser. There's no
// server-side session store to revoke here (admin sessions are stateless
// JWTs) — bumping tokenVersion is the equivalent "log out everywhere"
// mechanism getAdminSession() already checks on every request.
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = adminResetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const reset = await AdminPasswordReset.findOne({
    where: { tokenHash: sha256Hex(token) },
  });

  if (!reset || reset.usedAt || reset.expiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  const admin = await AdminUser.findByPk(reset.adminId);
  if (!admin) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  admin.passwordHash = await hashPassword(password);
  admin.tokenVersion += 1;
  await admin.save();

  reset.usedAt = new Date();
  await reset.save();

  return NextResponse.json({ ok: true });
}
