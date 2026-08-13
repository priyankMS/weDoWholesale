import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { PasswordReset } from "@/lib/db/models/PasswordReset";
import { User } from "@/lib/db/models/User";
import { hashPassword } from "@/lib/auth/password";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const reset = await PasswordReset.findOne({ where: { token } });

  if (
    !reset ||
    reset.usedAt ||
    reset.expiresAt.getTime() < Date.now()
  ) {
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
  await user.save();

  reset.usedAt = new Date();
  await reset.save();

  return NextResponse.json({ ok: true });
}
