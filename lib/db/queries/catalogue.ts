import { Op } from "sequelize";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { variantLabel } from "@/lib/format";

// ── Category chrome ──
// The mockup's demo catalog used 7 fictional categories (beef, chicken,
// lamb, goat, fish, turkey, drinks). The real `wdh_products.category`
// column has 9 distinct values and no "Turkey" — confirmed by querying the
// live data rather than trusting the mockup's placeholder set.
export const CATEGORY_ICONS: Record<string, string> = {
  Beef: "🐄",
  Chicken: "🐔",
  Lamb: "🐑",
  Goat: "🐐",
  Fish: "🐟",
  Drinks: "🧃",
  Groceries: "🛒",
  Snacks: "🍿",
  Desserts: "🍰",
};

const MEAT_CATEGORIES = new Set(["Beef", "Chicken", "Lamb", "Goat", "Fish"]);

// A handful of obviously junk rows left over in the imported staging data
// ("beef test", "chicken test", "lamb test", "Fish test") — filtered out
// rather than shown to real wholesale buyers.
const TEST_ITEM_NAMES = ["beef test", "chicken test", "lamb test", "Fish test"];

export function categorySlug(category: string): string {
  return category.toLowerCase().trim();
}

export function categoryFromSlug(slug: string, categories: string[]): string | null {
  return categories.find((c) => categorySlug(c) === slug) ?? null;
}

export type StockState = "in" | "low" | "out";

// All 267 real variant rows currently carry stock_count = 100 (the staging
// import doesn't yet reflect live inventory) — this threshold is written
// generically so low/out-of-stock badges activate correctly once real
// inventory numbers start flowing in, rather than being hardcoded to the
// current (uniform) snapshot.
const LOW_STOCK_THRESHOLD = 20;

export function stockStateFor(stockCount: number | null): StockState {
  const n = stockCount ?? 0;
  if (n <= 0) return "out";
  if (n <= LOW_STOCK_THRESHOLD) return "low";
  return "in";
}

function bestVariantPrice(
  variant: WdhVariant,
  pricing: WdhVariantPricing[],
): number | null {
  if (variant.discountPrice != null) return Number(variant.discountPrice);
  if (variant.basePrice != null) return Number(variant.basePrice);
  const positive = pricing
    .map((p) => (p.dealerPrice != null ? Number(p.dealerPrice) : null))
    .filter((p): p is number => p != null && p > 0);
  if (!positive.length) return null;
  return Math.min(...positive);
}

// `cut_value` is unused in the real data (only garbage test values) so
// it's deliberately left out of variantLabel (imported from lib/format —
// see the note there for why it doesn't live in this module).

export function unitFor(category: string, per: string | null): string {
  if (per && per.trim()) return per.replace(/^Price per /i, "");
  return MEAT_CATEGORIES.has(category) ? "kg" : "unit";
}

export type VariantSummary = {
  id: number;
  label: string;
  conditionType: string | null;
  boneType: string | null;
  skinType: string | null;
  price: number | null;
  stockCount: number;
  stockState: StockState;
  image: string | null;
};

export type ProductSummary = {
  id: number;
  name: string;
  category: string;
  categorySlug: string;
  type: string | null;
  icon: string;
  unit: string;
  minPrice: number | null;
  variants: VariantSummary[];
  stockState: StockState;
  image: string | null;
};

function toSummary(product: WdhProduct): ProductSummary {
  const variants = (product.variants ?? []).map((v): VariantSummary => {
    const price = bestVariantPrice(v, v.pricing ?? []);
    const stockState = stockStateFor(v.stockCount ?? null);
    return {
      id: v.id,
      label: variantLabel(v),
      conditionType: v.conditionType || null,
      boneType: v.boneType || null,
      skinType: v.skinType || null,
      price,
      stockCount: v.stockCount ?? 0,
      stockState,
      image: v.image1 || v.thumbnail || null,
    };
  });

  const prices = variants.map((v) => v.price).filter((p): p is number => p != null);
  const productImage =
    variants.find((v) => v.price != null && v.image)?.image ??
    variants.find((v) => v.image)?.image ??
    product.thumbnail ??
    null;
  const stockStates = variants.map((v) => v.stockState);
  const overallStock: StockState = stockStates.includes("in")
    ? "in"
    : stockStates.includes("low")
      ? "low"
      : stockStates.length
        ? "out"
        : "in";

  return {
    id: product.id,
    name: product.item,
    category: product.category ?? "",
    categorySlug: categorySlug(product.category ?? ""),
    type: product.type || null,
    icon: CATEGORY_ICONS[product.category ?? ""] ?? "🍽",
    unit: unitFor(product.category ?? "", product.variants?.[0]?.per ?? null),
    minPrice: prices.length ? Math.min(...prices) : null,
    variants,
    stockState: overallStock,
    image: productImage,
  };
}

const productInclude = [
  {
    model: WdhVariant,
    as: "variants",
    include: [{ model: WdhVariantPricing, as: "pricing" }],
  },
];

export async function getCategorySummaries() {
  const rows = (await WdhProduct.findAll({
    where: { item: { [Op.notIn]: TEST_ITEM_NAMES } },
    attributes: ["category"],
  })) as WdhProduct[];

  const counts = new Map<string, number>();
  for (const row of rows) {
    const cat = row.category ?? "";
    if (!cat) continue;
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({
      category,
      slug: categorySlug(category),
      icon: CATEGORY_ICONS[category] ?? "🍽",
      count,
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

export async function getAllCategoryNames(): Promise<string[]> {
  const rows = await WdhProduct.findAll({
    attributes: ["category"],
    group: ["category"],
  });
  return rows.map((r) => r.category ?? "").filter(Boolean);
}

export type ProductQuerySort = "default" | "price-asc" | "price-desc" | "name-asc" | "stock";

export type ProductQueryParams = {
  category: string;
  search?: string;
  type?: string;
  condition?: string[];
  bone?: string[];
  skin?: string[];
  stock?: StockState[];
  priceMin?: number;
  priceMax?: number;
  sort?: ProductQuerySort;
  page?: number;
  pageSize?: number;
};

export type ProductFacets = {
  types: string[];
  condition: string[];
  bone: string[];
  skin: string[];
};

export type ProductQueryResult = {
  products: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  facets: ProductFacets;
};

function uniqueSorted(values: (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v && v.trim().length > 0))).sort(
    (a, b) => a.localeCompare(b),
  );
}

// The category listing screen (Phase 2 Discovery and Browsing). Pushes
// category/search/type down to SQL (the only filters that map to plain
// columns); condition/bone/skin/stock/price are derived per-variant
// aggregates (best price across suppliers, computed stock state) so
// they're applied after `toSummary`, then sorted and paginated in memory.
// Category result sets top out around 40 rows, so this is a single
// category-scoped query rather than N+1 — well within what a JS-side
// filter/sort/slice pass can do in microseconds; it isn't a full-table
// scan the way `getAllProducts()` would be.
export async function queryProducts(params: ProductQueryParams): Promise<ProductQueryResult> {
  const {
    category,
    search,
    type,
    condition = [],
    bone = [],
    skin = [],
    stock = [],
    priceMin,
    priceMax,
    sort = "default",
    page = 1,
    pageSize = 10,
  } = params;

  const where: Record<string | symbol, unknown> = {
    category,
    item: { [Op.notIn]: TEST_ITEM_NAMES },
  };
  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    where[Op.or as unknown as string] = [
      { item: { [Op.like]: `%${trimmedSearch}%` } },
      { type: { [Op.like]: `%${trimmedSearch}%` } },
    ];
  }
  if (type && type !== "All") where.type = type;

  const rows = await WdhProduct.findAll({ where, include: productInclude, order: [["item", "ASC"]] });
  let products = rows.map(toSummary);

  // Facet option lists reflect the category+search+type scope (what a
  // faceted-search UI conventionally shows) — computed before the
  // condition/bone/skin/stock/price filters below are applied, so picking
  // one facet doesn't hide the others still reachable from here.
  const facets: ProductFacets = {
    types: uniqueSorted(rows.map((r) => r.type)),
    condition: uniqueSorted(products.flatMap((p) => p.variants.map((v) => v.conditionType))),
    bone: uniqueSorted(products.flatMap((p) => p.variants.map((v) => v.boneType))),
    skin: uniqueSorted(products.flatMap((p) => p.variants.map((v) => v.skinType))),
  };

  products = products.filter((p) => {
    if (condition.length && !p.variants.some((v) => v.conditionType && condition.includes(v.conditionType)))
      return false;
    if (bone.length && !p.variants.some((v) => v.boneType && bone.includes(v.boneType))) return false;
    if (skin.length && !p.variants.some((v) => v.skinType && skin.includes(v.skinType))) return false;
    if (stock.length && !stock.includes(p.stockState)) return false;
    if (priceMin != null && (p.minPrice == null || p.minPrice < priceMin)) return false;
    if (priceMax != null && (p.minPrice == null || p.minPrice > priceMax)) return false;
    return true;
  });

  if (sort === "price-asc")
    products = [...products].sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
  if (sort === "price-desc")
    products = [...products].sort((a, b) => (b.minPrice ?? -Infinity) - (a.minPrice ?? -Infinity));
  if (sort === "name-asc") products = [...products].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "stock")
    products = [...products].sort((a, b) => (a.stockState === "in" ? 0 : 1) - (b.stockState === "in" ? 0 : 1));

  const total = products.length;
  const start = (page - 1) * pageSize;
  const paged = products.slice(start, start + pageSize);
  const hasMore = start + paged.length < total;

  return { products: paged, total, page, pageSize, hasMore, facets };
}

export async function getAllProducts(): Promise<ProductSummary[]> {
  const rows = await WdhProduct.findAll({
    where: { item: { [Op.notIn]: TEST_ITEM_NAMES } },
    include: productInclude,
    order: [["item", "ASC"]],
  });
  return rows.map(toSummary);
}

export async function getProductDetail(id: number) {
  const product = await WdhProduct.findOne({
    where: { id, item: { [Op.notIn]: TEST_ITEM_NAMES } },
    include: productInclude,
  });
  if (!product) return null;
  return {
    summary: toSummary(product),
    shortDesc: product.shortDesc,
    longDesc1: product.longDesc1,
    sku: product.sku,
  };
}

// Home dashboard's "running low — order soon" nudge. Every variant in the
// current staging import carries stock_count = 100 (see the note by
// LOW_STOCK_THRESHOLD above), so this will genuinely return an empty list
// today — the dashboard hides the section entirely rather than fabricate
// low-stock items, and will start populating on its own once real
// inventory counts flow into wdh_variants.stock_count.
export async function getLowStockProducts(limit = 3): Promise<ProductSummary[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.stockState === "low").slice(0, limit);
}
