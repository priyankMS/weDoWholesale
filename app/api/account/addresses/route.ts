import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { Address } from "@/lib/db/models/Address";
import { User } from "@/lib/db/models/User";
import { addressSchema } from "@/lib/validation/account";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const addresses = await Address.findAll({
    where: { userId: session.userId },
    order: [
      ["isDefault", "DESC"],
      ["createdAt", "ASC"],
    ],
  });

  return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const [user, existingCount] = await Promise.all([
    User.findByPk(session.userId, { attributes: ["email"] }),
    Address.count({ where: { userId: session.userId } }),
  ]);

  const { label, business, street, city, postalCode, phone } = parsed.data;
  const address = await Address.create({
    userId: session.userId,
    label,
    name: business,
    address: street,
    city,
    zipCode: postalCode,
    mobile: phone,
    email: user?.email ?? null,
    country: "Canada",
    // The very first saved address becomes the default automatically —
    // every account needs at least one to check out with a delivery.
    isDefault: existingCount === 0,
  });

  return NextResponse.json({ address }, { status: 201 });
}
