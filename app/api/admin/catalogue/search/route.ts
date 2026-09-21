import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { getAllProducts } from "@/lib/db/queries/catalogue";

// Thin admin-authed wrapper around the existing catalogue query — backs the
// "add item" product/variant picker on the order revision screen. No new
// catalogue logic: reuses getAllProducts() and filters in memory, same as
// the customer-facing global search does with this same data shape.
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  const products = await getAllProducts();
  const filtered = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.variants.some((v) => v.sku?.toLowerCase().includes(q)),
      )
    : products;

  // The whole catalogue is only ~115 products — cheap to return in full so
  // every category shows in the picker's tree, not just whichever happen
  // to sort first alphabetically. This cap is just a sanity ceiling for a
  // much larger future catalogue, not a real limit today.
  return NextResponse.json({ products: filtered.slice(0, 1000) });
}
