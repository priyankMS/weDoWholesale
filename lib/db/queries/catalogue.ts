import { Op } from "sequelize";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";

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

// Real variants carry condition/bone/skin, not the mockup's fictional
// named cuts ("Whole", "Trimmed Fat" etc). `cut_value` is unused in the
// real data (only garbage test values) so it's deliberately left out.
export function variantLabel(variant: {
  conditionType?: string | null;
  boneType?: string | null;
  skinType?: string | null;
}): string {
  const parts = [variant.conditionType, variant.boneType, variant.skinType].filter(
    (v): v is string => !!v && v.trim().length > 0,
  );
  return parts.length ? parts.join(" · ") : "Standard";
}

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
    };
  });

  const prices = variants.map((v) => v.price).filter((p): p is number => p != null);
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

export async function getProductsByCategory(category: string): Promise<{
  products: ProductSummary[];
  parts: string[];
}> {
  const rows = await WdhProduct.findAll({
    where: { category, item: { [Op.notIn]: TEST_ITEM_NAMES } },
    include: productInclude,
    order: [["item", "ASC"]],
  });

  const products = rows.map(toSummary);
  const parts = Array.from(
    new Set(products.map((p) => p.type).filter((t): t is string => !!t)),
  ).sort((a, b) => a.localeCompare(b));

  return { products, parts };
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
