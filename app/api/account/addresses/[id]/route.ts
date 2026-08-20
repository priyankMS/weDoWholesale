import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { sequelize } from "@/lib/db/sequelize";
import { Address } from "@/lib/db/models/Address";
import { addressSchema } from "@/lib/validation/account";

async function loadOwnedAddress(userId: number, idParam: string) {
  const id = Number(idParam);
  if (!Number.isFinite(id)) return null;
  return Address.findOne({ where: { id, userId } });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { id } = await params;
  const address = await loadOwnedAddress(session.userId, id);
  if (!address) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  const body = await request.json();

  if (body?.action === "setDefault") {
    await sequelize.transaction(async (t) => {
      await Address.update(
        { isDefault: false },
        { where: { userId: session.userId }, transaction: t },
      );
      await address.update({ isDefault: true }, { transaction: t });
    });
    return NextResponse.json({ ok: true });
  }

  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { label, business, street, city, postalCode, phone } = parsed.data;
  await address.update({
    label,
    name: business,
    address: street,
    city,
    zipCode: postalCode,
    mobile: phone,
  });

  return NextResponse.json({ address });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { id } = await params;
  const address = await loadOwnedAddress(session.userId, id);
  if (!address) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  if (address.isDefault) {
    return NextResponse.json(
      { error: "Set another address as default before deleting this one." },
      { status: 400 },
    );
  }

  await address.destroy();
  return NextResponse.json({ ok: true });
}
