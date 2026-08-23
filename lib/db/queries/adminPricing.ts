import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { variantLabel } from "@/lib/format";
import type { AdminPricingCreateInput } from "@/lib/validation/adminPricing";

export type AdminPricingRow = {
  id: number;
  variantId: number;
  sku: string | null;
  productName: string;
  variantLabel: string;
  supplierId: number | null;
  supplierName: string | null;
  dealerPrice: number | null;
  priceIncrement: number | null;
  retailPrice: number | null;
  marginPercent: number | null;
};

export type AdminPricingListParams = {
  category?: string;
  supplierId?: number;
  page?: number;
  pageSize?: number;
};

export type AdminPricingListResult = {
  rows: AdminPricingRow[];
  total: number;
  page: number;
  pageSize: number;
};

function marginPercent(dealer: number | null, retail: number | null): number | null {
  if (dealer == null || retail == null || dealer <= 0) return null;
  return ((retail - dealer) / retail) * 100;
}

export async function listAdminPricing(
  params: AdminPricingListParams,
): Promise<AdminPricingListResult> {
  const { category, supplierId, page = 1, pageSize = 25 } = params;

  const where: Record<string, unknown> = {};
  if (supplierId) where.supplierId = supplierId;

  const variantWhere: Record<string, unknown> = {};
  const productWhere: Record<string, unknown> = {};
  if (category && category !== "All") productWhere.category = category;

  const { rows, count } = await WdhVariantPricing.findAndCountAll({
    where,
    include: [
      {
        model: WdhVariant,
        where: Object.keys(variantWhere).length ? variantWhere : undefined,
        required: true,
        include: [
          {
            model: WdhProduct,
            attributes: ["id", "item", "category"],
            where: Object.keys(productWhere).length ? productWhere : undefined,
            required: Object.keys(productWhere).length > 0,
          },
        ],
      },
      { model: WdhSupplier },
    ],
    order: [["id", "ASC"]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    distinct: true,
  });

  const mapped: AdminPricingRow[] = rows.map((p) => {
    const variant = (p as WdhVariantPricing & { WdhVariant?: WdhVariant }).WdhVariant;
    const product = (variant as (WdhVariant & { WdhProduct?: WdhProduct }) | undefined)?.WdhProduct;
    const supplier = (p as WdhVariantPricing & { WdhSupplier?: WdhSupplier }).WdhSupplier;
    const dealerPrice = p.dealerPrice != null ? Number(p.dealerPrice) : null;
    const retailPrice = p.retailPrice != null ? Number(p.retailPrice) : null;
    return {
      id: p.id,
      variantId: p.variantId,
      sku: variant?.sku ?? null,
      productName: product?.item ?? "—",
      variantLabel: variant ? variantLabel(variant) : "—",
      supplierId: p.supplierId,
      supplierName: supplier?.name ?? null,
      dealerPrice,
      priceIncrement: p.priceIncrement != null ? Number(p.priceIncrement) : null,
      retailPrice,
      marginPercent: marginPercent(dealerPrice, retailPrice),
    };
  });

  return { rows: mapped, total: count, page, pageSize };
}

export type VariantWithoutPricing = {
  variantId: number;
  sku: string | null;
  productName: string;
  variantLabel: string;
  category: string;
};

// listAdminPricing above starts from WdhVariantPricing, so a variant that
// has never had a pricing row created for it simply never appears there —
// this is the other half of Price Control: surfacing those gaps so an
// admin can see them and add a first price, not just edit existing ones.
export async function listVariantsWithoutPricing(): Promise<VariantWithoutPricing[]> {
  const variants = await WdhVariant.findAll({
    include: [
      { model: WdhVariantPricing, as: "pricing", required: false, attributes: ["id"] },
      { model: WdhProduct, attributes: ["item", "category"] },
    ],
    where: { "$pricing.id$": null },
    order: [["id", "ASC"]],
  });

  return variants.map((v) => {
    const product = (v as WdhVariant & { WdhProduct?: WdhProduct }).WdhProduct;
    return {
      variantId: v.id,
      sku: v.sku,
      productName: product?.item ?? "—",
      variantLabel: variantLabel(v),
      category: product?.category ?? "—",
    };
  });
}

export type ProductPricingVariant = {
  variantId: number;
  sku: string | null;
  variantLabel: string;
  rows: AdminPricingRow[];
};

// Powers the product detail panel's Pricing tab — every variant of one
// product, each with its own pricing rows (one per supplier), so the whole
// tab can render from a single fetch.
export async function getPricingForProduct(productId: number): Promise<ProductPricingVariant[]> {
  const variants = await WdhVariant.findAll({
    where: { productId },
    include: [{ model: WdhVariantPricing, as: "pricing", include: [{ model: WdhSupplier }] }],
    order: [["id", "ASC"]],
  });

  return variants.map((v) => {
    const rows: AdminPricingRow[] = (v.pricing ?? []).map((p) => {
      const supplier = (p as WdhVariantPricing & { WdhSupplier?: WdhSupplier }).WdhSupplier;
      const dealerPrice = p.dealerPrice != null ? Number(p.dealerPrice) : null;
      const retailPrice = p.retailPrice != null ? Number(p.retailPrice) : null;
      return {
        id: p.id,
        variantId: v.id,
        sku: v.sku,
        productName: "",
        variantLabel: variantLabel(v),
        supplierId: p.supplierId,
        supplierName: supplier?.name ?? null,
        dealerPrice,
        priceIncrement: p.priceIncrement != null ? Number(p.priceIncrement) : null,
        retailPrice,
        marginPercent: marginPercent(dealerPrice, retailPrice),
      };
    });
    return { variantId: v.id, sku: v.sku, variantLabel: variantLabel(v), rows };
  });
}

export async function createAdminPricing(input: AdminPricingCreateInput): Promise<WdhVariantPricing> {
  return WdhVariantPricing.create({
    variantId: input.variantId,
    supplierId: input.supplierId ?? null,
    label: input.label || "Standard",
    dealerPrice: input.dealerPrice ?? null,
    priceIncrement: input.priceIncrement ?? null,
    retailPrice: input.retailPrice ?? null,
  });
}
