import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getAllProducts,
  queryProducts,
  type ProductQuerySort,
  type StockState,
} from "@/lib/db/queries/catalogue";

function splitCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function toNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

const SORTS: ProductQuerySort[] = ["default", "price-asc", "price-desc", "name-asc", "stock"];

// Backs the category listing screen (Phase 2 Discovery and Browsing).
// `?category=` switches into the paginated/filtered mode (queryProducts);
// without it, falls back to the original full-catalogue fetch used by the
// global search and saved-items screens, which don't scope to one category
// and are small enough to filter client-side.
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const url = new URL(request.url);
  const sp = url.searchParams;
  const category = sp.get("category");

  if (!category) {
    const products = await getAllProducts();
    return NextResponse.json({ products });
  }

  const sortParam = sp.get("sort") ?? "default";
  const sort = (SORTS as string[]).includes(sortParam) ? (sortParam as ProductQuerySort) : "default";

  const result = await queryProducts({
    category,
    search: sp.get("q") ?? undefined,
    type: sp.get("type") ?? undefined,
    condition: splitCsv(sp.get("condition")),
    bone: splitCsv(sp.get("bone")),
    skin: splitCsv(sp.get("skin")),
    stock: splitCsv(sp.get("stock")) as StockState[],
    priceMin: toNumber(sp.get("priceMin")),
    priceMax: toNumber(sp.get("priceMax")),
    sort,
    page: toNumber(sp.get("page")) ?? 1,
    pageSize: Math.min(toNumber(sp.get("pageSize")) ?? 10, 50),
  });

  return NextResponse.json(result);
}
