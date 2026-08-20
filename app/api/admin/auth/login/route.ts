import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation/admin";
import { AdminUser } from "@/lib/db/models/AdminUser";
import { verifyPassword } from "@/lib/auth/password";
import { createAdminSession } from "@/lib/auth/adminSession";

// Precomputed bcrypt hash with no matching password — compared against
// when the account doesn't exist, so a wrong email and a wrong password
// take the same ~100ms and return the same generic error. Same pattern as
// app/api/auth/login/route.ts.
const DUMMY_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEeO2Q6QW.hJfz8m1mZ8i6zH5v6b1r7cG0G";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const admin = await AdminUser.findOne({ where: { email } });

  const passwordOk = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !passwordOk) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await createAdminSession({
    adminId: admin.id,
    name: admin.name,
    email: admin.email,
    tokenVersion: admin.tokenVersion,
  });

  return NextResponse.json({ name: admin.name, email: admin.email });
}
