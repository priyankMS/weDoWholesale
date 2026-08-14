import { NextResponse } from "next/server";
import { UniqueConstraintError } from "sequelize";
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

  let user;
  try {
    user = await User.create({
      // `userName` is a pre-existing column on the shared `users` table
      // (used by the retail site) — the contact person's name is the
      // closest fit for a wholesale registration.
      userName: contactName,
      businessType,
      businessName,
      city,
      businessAddress: address,
      monthlyVolume,
      contactName,
      role,
      email,
      phone,
      passwordHash,
    });
  } catch (err) {
    // Guards the race between the findOne check above and this insert —
    // the unique index on email is the real source of truth.
    if (err instanceof UniqueConstraintError) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    throw err;
  }

  await createSession({
    userId: user.id,
    status: user.status,
    tokenVersion: user.tokenVersion,
  });

  return NextResponse.json({ status: user.status });
}
