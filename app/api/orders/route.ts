import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createOrderSchema } from "@/lib/validation/orders";
import { createOrder, OrderError } from "@/lib/db/queries/orders";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const receipt = await createOrder(session.userId, parsed.data);
    return NextResponse.json(receipt);
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
