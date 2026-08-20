import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { lookupOrderForSupport } from "@/lib/db/queries/support";

// Screen 30's order lookup card.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { orderNumber } = await params;
  const result = await lookupOrderForSupport(session.userId, orderNumber);
  if (!result) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ result });
}
