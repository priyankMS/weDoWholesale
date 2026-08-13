import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation/auth";
import { User } from "@/lib/db/models/User";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { password, businessType, businessName, city, address, monthlyVolume, contactName, role, email, phone } =
    parsed.data;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    businessType,
    businessName,
    city,
    address,
    monthlyVolume,
    contactName,
    role,
    email,
    phone,
    passwordHash,
  });

  await createSession({ userId: user.id, status: user.status });

  return NextResponse.json({ status: user.status });
}
