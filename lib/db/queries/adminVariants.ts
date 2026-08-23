import { Op } from "sequelize";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { stockStateFor, type StockState } from "@/lib/db/queries/catalogue";
import { variantLabel } from "@/lib/format";

export type AdminVariantRow = {
  id: number;
  sku: string | null;
  productId: number;
  productName: string;
  category: string;
  conditionType: string | null;
  cutType: string | null;
  boneType: string | null;
  skinType: string | null;
  label: string;
  unit: string | null;
  stockCount: number;
  stockState: StockState;
  basePrice: number | null;
  discountPrice: number | null;
  supplierNames: string[];
};

export type AdminVariantListParams = {
  search?: string;
  category?: string;
  condition?: string;
  bone?: string;
  page?: number;
  pageSize?: number;
};

export type AdminVariantListResult = {
  variants: AdminVariantRow[];
  total: number;
  page: number;
  pageSize: number;
};

const include = [
  { model: WdhProduct, attributes: ["id", "item", "category"] },
  { model: WdhVariantPricing, as: "pricing", include: [{ model: WdhSupplier }] },
];

export async function listAdminVariants(
  params: AdminVariantListParams,
): Promise<AdminVariantListResult> {
  const { search, category, condition, bone, page = 1, pageSize = 25 } = params;

  const where: Record<string | symbol, unknown> = {};
  const trimmed = search?.trim();
  if (trimmed) {
    where[Op.or as unknown as string] = [
      { sku: { [Op.like]: `%${trimmed}%` } },
      { shortTitle: { [Op.like]: `%${trimmed}%` } },
    ];
  }
  if (condition && condition !== "All") where.conditionType = condition;
  if (bone && bone !== "All") where.boneType = bone;

  const productWhere: Record<string, unknown> = {};
  if (category && category !== "All") productWhere.category = category;

  const { rows, count } = await WdhVariant.findAndCountAll({
    where,
    include: [
      { ...include[0], where: Object.keys(productWhere).length ? productWhere : undefined, required: true },
      include[1],
    ],
    order: [["id", "ASC"]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    distinct: true,
  });

  const variants: AdminVariantRow[] = rows.map((v) => {
    const product = (v as WdhVariant & { WdhProduct?: WdhProduct }).WdhProduct;
    const supplierNames = new Set<string>();
    for (const p of v.pricing ?? []) {
      const pricingWithSupplier = p as WdhVariantPricing & { WdhSupplier?: WdhSupplier };
      if (pricingWithSupplier.WdhSupplier) supplierNames.add(pricingWithSupplier.WdhSupplier.name);
    }
    return {
      id: v.id,
      sku: v.sku,
      productId: product?.id ?? 0,
      productName: product?.item ?? "—",
      category: product?.category ?? "",
      conditionType: v.conditionType || null,
      cutType: v.cutType || null,
      boneType: v.boneType || null,
      skinType: v.skinType || null,
      label: variantLabel(v),
      unit: v.per || null,
      stockCount: v.stockCount ?? 0,
      stockState: stockStateFor(v.stockCount ?? null),
      basePrice: v.basePrice != null ? Number(v.basePrice) : null,
      discountPrice: v.discountPrice != null ? Number(v.discountPrice) : null,
      supplierNames: Array.from(supplierNames),
    };
  });

  return { variants, total: count, page, pageSize };
}

export async function listVariantsForProduct(productId: number): Promise<AdminVariantRow[]> {
  const rows = await WdhVariant.findAll({
    where: { productId },
    include,
    order: [["id", "ASC"]],
  });

  return rows.map((v) => {
    const product = (v as WdhVariant & { WdhProduct?: WdhProduct }).WdhProduct;
    const supplierNames = new Set<string>();
    for (const p of v.pricing ?? []) {
      const pricingWithSupplier = p as WdhVariantPricing & { WdhSupplier?: WdhSupplier };
      if (pricingWithSupplier.WdhSupplier) supplierNames.add(pricingWithSupplier.WdhSupplier.name);
    }
    return {
      id: v.id,
      sku: v.sku,
      productId: product?.id ?? productId,
      productName: product?.item ?? "—",
      category: product?.category ?? "",
      conditionType: v.conditionType || null,
      cutType: v.cutType || null,
      boneType: v.boneType || null,
      skinType: v.skinType || null,
      label: variantLabel(v),
      unit: v.per || null,
      stockCount: v.stockCount ?? 0,
      stockState: stockStateFor(v.stockCount ?? null),
      basePrice: v.basePrice != null ? Number(v.basePrice) : null,
      discountPrice: v.discountPrice != null ? Number(v.discountPrice) : null,
      supplierNames: Array.from(supplierNames),
    };
  });
}

export async function getVariantFacets(): Promise<{
  conditions: string[];
  bones: string[];
  skins: string[];
}> {
  const [conditions, bones, skins] = await Promise.all([
    WdhVariant.findAll({ attributes: ["conditionType"], group: ["conditionType"] }),
    WdhVariant.findAll({ attributes: ["boneType"], group: ["boneType"] }),
    WdhVariant.findAll({ attributes: ["skinType"], group: ["skinType"] }),
  ]);
  return {
    conditions: conditions.map((c) => c.conditionType || "").filter(Boolean).sort(),
    bones: bones.map((b) => b.boneType || "").filter(Boolean).sort(),
    skins: skins.map((s) => s.skinType || "").filter(Boolean).sort(),
  };
}
