import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAllProducts } from "@/lib/db/queries/catalogue";

// Backs the global search screen — the full 166-product catalogue is small
// enough to fetch once and filter/sort client-side, same as every other
// list screen in this phase (mirrors the mockup's client-side filtering,
// just against real data instead of a hardcoded demo catalog).
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const products = await getAllProducts();
  return NextResponse.json({ products });
}
