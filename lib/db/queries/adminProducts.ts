import { Op } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { stockStateFor, type StockState } from "@/lib/db/queries/catalogue";
import type { AdminProductCreateInput } from "@/lib/validation/adminProducts";

export type AdminProductRow = {
  id: number;
  sku: string | null;
  name: string;
  category: string;
  type: string | null;
  variantCount: number;
  supplierNames: string[];
  stockState: StockState;
  seoComplete: boolean;
  retailPrice: number | null;
};

export type AdminProductListParams = {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
};

export type AdminProductListResult = {
  products: AdminProductRow[];
  total: number;
  page: number;
  pageSize: number;
};

const productInclude = [
  {
    model: WdhVariant,
    as: "variants",
    include: [{ model: WdhVariantPricing, as: "pricing", include: [{ model: WdhSupplier }] }],
  },
];

export async function listAdminProducts(
  params: AdminProductListParams,
): Promise<AdminProductListResult> {
  const { search, category, page = 1, pageSize = 20 } = params;

  const where: Record<string | symbol, unknown> = {};
  const trimmed = search?.trim();
  if (trimmed) {
    where[Op.or as unknown as string] = [
      { item: { [Op.like]: `%${trimmed}%` } },
      { sku: { [Op.like]: `%${trimmed}%` } },
    ];
  }
  if (category && category !== "All") where.category = category;

  const { rows, count } = await WdhProduct.findAndCountAll({
    where,
    include: productInclude,
    order: [["item", "ASC"]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    distinct: true,
  });

  const products: AdminProductRow[] = rows.map((product) => {
    const variants = product.variants ?? [];
    const supplierNames = new Set<string>();
    const prices: number[] = [];
    const stockStates: StockState[] = [];

    for (const v of variants) {
      stockStates.push(stockStateFor(v.stockCount ?? null));
      if (v.basePrice != null) prices.push(Number(v.basePrice));
      for (const p of v.pricing ?? []) {
        const pricingWithSupplier = p as WdhVariantPricing & { WdhSupplier?: WdhSupplier };
        if (pricingWithSupplier.WdhSupplier) supplierNames.add(pricingWithSupplier.WdhSupplier.name);
      }
    }

    const overallStock: StockState = stockStates.includes("in")
      ? "in"
      : stockStates.includes("low")
        ? "low"
        : stockStates.length
          ? "out"
          : "in";

    return {
      id: product.id,
      sku: product.sku,
      name: product.item,
      category: product.category ?? "",
      type: product.type,
      variantCount: variants.length,
      supplierNames: Array.from(supplierNames),
      stockState: overallStock,
      seoComplete: !!(product.metaTitle?.trim() && product.metaDesc?.trim()),
      retailPrice: prices.length ? Math.min(...prices) : null,
    };
  });

  return { products, total: count, page, pageSize };
}

// Creates a product together with its first variant (and, if pricing was
// filled in, that variant's first pricing row) as one transaction — a bare
// WdhProduct row with zero variants can't show a price or stock state
// anywhere in the customer catalogue, so leaving them out would produce a
// product an admin can save but never actually see or sell.
export async function createAdminProduct(input: AdminProductCreateInput): Promise<{ productId: number }> {
  return sequelize.transaction(async (t) => {
    const product = await WdhProduct.create(
      {
        item: input.item,
        category: input.category,
        type: input.type ?? null,
        sku: input.sku ?? null,
        shortDescHeading: null,
        shortDesc: input.shortDesc ?? null,
        longDescHeading: null,
        longDesc1: input.longDesc1 ?? null,
        longDesc2: null,
        longDesc3: null,
        metaTitle: input.metaTitle ?? null,
        metaDesc: input.metaDesc ?? null,
        tags: null,
        region: null,
        cuisine: null,
        thumbnail: null,
        thumbnailAlt: input.thumbnailAlt ?? null,
        image1: null,
        image1Alt: null,
        image2: null,
        image2Alt: null,
        image3: null,
        image3Alt: null,
      },
      { transaction: t },
    );

    const variant = await WdhVariant.create(
      {
        productId: product.id,
        sku: input.sku ?? null,
        shortTitle: input.variantLabel ?? null,
        longTitle: input.variantLabel ?? null,
        cutValue: null,
        basePrice: input.retailPrice ?? null,
        discountPrice: null,
        per: input.unit,
        stockCount: input.stockCount ?? 0,
        stockStatus: (input.stockCount ?? 0) > 0 ? "instock" : "outofstock",
        thumbnail: null,
        thumbnailAlt: null,
        image1: null,
        image1Alt: null,
        image2: null,
        image2Alt: null,
        image3: null,
        image3Alt: null,
      },
      { transaction: t },
    );

    if (input.dealerPrice != null || input.retailPrice != null) {
      await WdhVariantPricing.create(
        {
          variantId: variant.id,
          supplierId: input.supplierId ?? null,
          label: input.variantLabel || "Standard",
          dealerPrice: input.dealerPrice ?? null,
          priceIncrement: input.priceIncrement ?? null,
          retailPrice: input.retailPrice ?? null,
        },
        { transaction: t },
      );
    }

    return { productId: product.id };
  });
}

export async function getAdminProductCategories(): Promise<string[]> {
  const rows = await WdhProduct.findAll({ attributes: ["category"], group: ["category"] });
  return rows.map((r) => r.category ?? "").filter(Boolean).sort((a, b) => a.localeCompare(b));
}

// 100+ distinct values (Shoulder, Kabab, Sausage, Sujuk, ...) — too varied
// for a restrictive <select>, so this backs a <datalist> autocomplete on
// the New Product form instead: suggests real part names but still lets
// an admin type a genuinely new one. Grouped by category so picking
// "Fish" doesn't suggest "Chuck" or "Cosmetics" from unrelated categories.
export async function getAdminProductTypesByCategory(): Promise<Record<string, string[]>> {
  const rows = await WdhProduct.findAll({ attributes: ["category", "type"], group: ["category", "type"] });
  const byCategory: Record<string, string[]> = {};
  for (const r of rows) {
    if (!r.category || !r.type) continue;
    (byCategory[r.category] ??= []).push(r.type);
  }
  for (const category of Object.keys(byCategory)) {
    byCategory[category].sort((a, b) => a.localeCompare(b));
  }
  return byCategory;
}
