import { Op } from "sequelize";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
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
  Turkey: "🦃",
  Drinks: "🧃",
  Groceries: "🛒",
  Snacks: "🍿",
  Desserts: "🍰",
};

const MEAT_CATEGORIES = new Set(["Beef", "Chicken", "Lamb", "Goat", "Fish", "Turkey"]);

// A handful of obviously junk rows left over in the imported staging data
// ("beef test", "chicken test", "lamb test", "Fish test") — filtered out
// rather than shown to real wholesale buyers.
export const TEST_ITEM_NAMES = ["beef test", "chicken test", "lamb test", "Fish test"];

export function categorySlug(category: string): string {
  return category.toLowerCase().trim();
}

export function categoryFromSlug(slug: string, categories: string[]): string | null {
  return categories.find((c) => categorySlug(c) === slug) ?? null;
}

export type StockState = "in" | "low" | "out";

// Stock is managed directly by status (admin picks In/Low/Out per variant),
// not derived from a quantity number — the source CSV's "Stock Count" was a
// uniform placeholder (1 for every one of the 241 rows), not a real
// inventory count, so thresholding on it made every single variant show as
// "low stock" regardless of actual availability. wdh_variants.stock_status
// defaults to "instock" from that same import; anything not recognized
// below falls back to "in" rather than a false "low"/"out".
export function stockStateFor(stockStatus: string | null | undefined): StockState {
  const s = (stockStatus ?? "").trim().toLowerCase();
  if (s === "low" || s === "lowstock" || s === "low_stock") return "low";
  if (s === "out" || s === "outofstock" || s === "out_of_stock") return "out";
  return "in";
}

// This is a wholesale portal, not a retail storefront — the price shown to
// buyers is the Pricing tab's per-supplier dealer cost + markup % (already
// computed into `retailPrice` on each wdh_variant_pricing row), not the raw
// dealer/supplier cost. wdh_variants.basePrice/discountPrice remain a manual
// per-variant override for the rare case an admin needs to set one price
// regardless of supplier — most imported variants leave both null so this
// per-supplier pricing is the only source of truth.
export function bestVariantPrice(
  variant: WdhVariant,
  pricing: WdhVariantPricing[],
): number | null {
  if (variant.discountPrice != null) return Number(variant.discountPrice);
  if (variant.basePrice != null) return Number(variant.basePrice);
  const positive = pricing
    .map((p) => (p.retailPrice != null ? Number(p.retailPrice) : null))
    .filter((p): p is number => p != null && p > 0);
  if (!positive.length) return null;
  return Math.min(...positive);
}

// `cut_value` (free-text product form, e.g. "Whole Chicken With Skin") is
// deliberately left out of variantLabel's primary parts and only appended —
// see the note in lib/format.ts (imported from there since that module is
// client-safe and this one pulls in Sequelize). `cut_type` (the Cut Style
// facet — Whole/Cubes/Stew Cut/etc, from the wdh_options cut_type enum) is
// the real buyer-facing Cut Style selector and is filtered/faceted below.

export function unitFor(category: string, per: string | null): string {
  if (per && per.trim()) return per.replace(/^Price per /i, "");
  return MEAT_CATEGORIES.has(category) ? "kg" : "unit";
}

export type VariantSummary = {
  id: number;
  sku: string | null;
  label: string;
  conditionType: string | null;
  cutType: string | null;
  boneType: string | null;
  skinType: string | null;
  fatLevel: string | null;
  origin: string | null;
  cutValue: string | null;
  minOrderQty: number | null;
  minOrderUnit: string | null;
  price: number | null;
  stockState: StockState;
  image: string | null;
  supplierName: string | null;
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
    const stockState = stockStateFor(v.stockStatus);
    // Every wdh_variant_pricing row carries a real supplier_id from the
    // original import (confirmed against live data — all 274 rows have
    // one, even the ~97% with no usable price), so this reflects an
    // actual supplier association, not a guess. Doesn't necessarily match
    // which price is shown (that can come from the wholesale-pricing seed
    // instead of this table) — it's for display grouping only.
    const pricingWithSupplier = (v.pricing ?? []) as (WdhVariantPricing & {
      WdhSupplier?: WdhSupplier;
    })[];
    const supplierName = pricingWithSupplier.find((p) => p.WdhSupplier)?.WdhSupplier?.name ?? null;
    return {
      id: v.id,
      sku: v.sku || null,
      label: variantLabel(v),
      conditionType: v.conditionType || null,
      cutType: v.cutType || null,
      boneType: v.boneType || null,
      skinType: v.skinType || null,
      fatLevel: v.fatLevel || null,
      origin: v.region || null,
      cutValue: v.cutValue || null,
      minOrderQty: v.minOrderQty != null ? Number(v.minOrderQty) : null,
      minOrderUnit: v.minOrderUnit || null,
      price,
      stockState,
      // The client's photo library (images.wedohalal.com) is unreliable —
      // wrong/mismatched cuts, some 404s (see ProductCard's onError note) —
      // so every product card intentionally uses the category icon +
      // gradient tile (productIcon/categoryGradient in lib/productVisuals)
      // instead of a per-product photo, matching the Dropbox mockup's
      // generic 🥩 icon treatment rather than showing incorrect photos.
      image: null,
      supplierName,
    };
  });

  const prices = variants.map((v) => v.price).filter((p): p is number => p != null);
  const productImage = null;
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
    include: [{ model: WdhVariantPricing, as: "pricing", include: [{ model: WdhSupplier }] }],
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
  cut?: string[];
  bone?: string[];
  skin?: string[];
  fat?: string[];
  stock?: StockState[];
  priceMin?: number;
  priceMax?: number;
  sort?: ProductQuerySort;
  page?: number;
  pageSize?: number;
};

export type ProductFacets = {
  types: string[];
  typeCounts: Record<string, number>;
  condition: string[];
  cut: string[];
  bone: string[];
  skin: string[];
  fat: string[];
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

// The raw cut-style column has a long tail of one-off/oddly-formatted values
// (leftover free text from the source catalog) — surfacing all of them turns
// the sidebar filter into a wall of near-useless checkboxes. Ranking by how
// many products actually use each value and keeping only the top N mirrors
// the type-chip row above the grid, which is popularity-ordered too.
function topByFrequency(values: (string | null | undefined)[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v || !v.trim()) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([v]) => v);
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
    cut = [],
    bone = [],
    skin = [],
    fat = [],
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
  const rows = await WdhProduct.findAll({ where, include: productInclude, order: [["item", "ASC"]] });
  let products = rows.map(toSummary);

  // Facet option lists reflect the category+search scope only (what a
  // faceted-search UI conventionally shows) — computed before the type
  // filter below (and the condition/bone/skin/stock/price filters further
  // down) are applied, so picking one facet doesn't hide the others still
  // reachable from here.
  const typeCounts: Record<string, number> = {};
  for (const r of rows) {
    if (!r.type || !r.type.trim()) continue;
    typeCounts[r.type] = (typeCounts[r.type] ?? 0) + 1;
  }

  const facets: ProductFacets = {
    types: uniqueSorted(rows.map((r) => r.type)),
    typeCounts,
    condition: uniqueSorted(products.flatMap((p) => p.variants.map((v) => v.conditionType))),
    cut: topByFrequency(products.flatMap((p) => p.variants.map((v) => v.cutType)), 10),
    bone: uniqueSorted(products.flatMap((p) => p.variants.map((v) => v.boneType))),
    skin: uniqueSorted(products.flatMap((p) => p.variants.map((v) => v.skinType))),
    fat: uniqueSorted(products.flatMap((p) => p.variants.map((v) => v.fatLevel))),
  };

  products = products.filter((p) => {
    if (type && type !== "All" && p.type !== type) return false;
    if (condition.length && !p.variants.some((v) => v.conditionType && condition.includes(v.conditionType)))
      return false;
    if (cut.length && !p.variants.some((v) => v.cutType && cut.includes(v.cutType))) return false;
    if (bone.length && !p.variants.some((v) => v.boneType && bone.includes(v.boneType))) return false;
    if (skin.length && !p.variants.some((v) => v.skinType && skin.includes(v.skinType))) return false;
    if (fat.length && !p.variants.some((v) => v.fatLevel && fat.includes(v.fatLevel))) return false;
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

// Home dashboard's "running low — order soon" nudge. Populates once an
// admin actually marks a variant Low Stock — see stockStateFor's note above.
export async function getLowStockProducts(limit = 3): Promise<ProductSummary[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.stockState === "low").slice(0, limit);
}
