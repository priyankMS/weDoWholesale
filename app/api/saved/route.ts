import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { SavedProduct } from "@/lib/db/models/SavedProduct";
import { toggleSavedSchema } from "@/lib/validation/catalogue";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const saved = await SavedProduct.findAll({ where: { userId: session.userId } });
  return NextResponse.json({ productIds: saved.map((s) => s.productId) });
}

// Toggles a single product's saved state for the signed-in user — add if
// not already saved, remove if it is.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = toggleSavedSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { productId } = parsed.data;
  const existing = await SavedProduct.findOne({
    where: { userId: session.userId, productId },
  });

  if (existing) {
    await existing.destroy();
    return NextResponse.json({ saved: false });
  }

  await SavedProduct.create({ userId: session.userId, productId });
  return NextResponse.json({ saved: true });
}
