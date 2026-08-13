import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { User } from "@/lib/db/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 },
    );
  }

  await createSession({ userId: user.id, status: user.status });

  return NextResponse.json({ status: user.status });
}
