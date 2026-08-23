import { Op } from "sequelize";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { variantLabel } from "@/lib/format";
import { TEST_ITEM_NAMES } from "@/lib/db/queries/catalogue";

export type SupplierPriceCell = {
  supplierId: number;
  dealerPrice: number | null;
};

export type SupplierCompareRow = {
  variantId: number;
  productName: string;
  variantLabel: string;
  category: string;
  prices: Map<number, number | null>; // supplierId -> dealerPrice
  cheapestSupplierId: number | null;
  hasConflict: boolean;
};

export type SupplierCompareResult = {
  suppliers: WdhSupplier[];
  rows: SupplierCompareRow[];
  sharedCount: number;
};

// A "shared" variant is priced by 2+ suppliers — the comparison only makes
// sense for those; single-supplier variants have nothing to compare against.
export async function getSupplierCompareData(category?: string): Promise<SupplierCompareResult> {
  const suppliers = await WdhSupplier.findAll({ order: [["sortOrder", "ASC"]] });

  const productWhere: Record<string, unknown> = { item: { [Op.notIn]: TEST_ITEM_NAMES } };
  if (category && category !== "All") productWhere.category = category;

  const variants = await WdhVariant.findAll({
    include: [
      {
        model: WdhProduct,
        attributes: ["id", "item", "category"],
        where: Object.keys(productWhere).length ? productWhere : undefined,
        required: Object.keys(productWhere).length > 0,
      },
      { model: WdhVariantPricing, as: "pricing" },
    ],
    order: [["id", "ASC"]],
  });

  const rows: SupplierCompareRow[] = [];

  for (const v of variants) {
    const product = (v as WdhVariant & { WdhProduct?: WdhProduct }).WdhProduct;
    const prices = new Map<number, number | null>();
    for (const p of v.pricing ?? []) {
      if (p.supplierId == null) continue;
      const dealer = p.dealerPrice != null ? Number(p.dealerPrice) : null;
      const existing = prices.get(p.supplierId);
      // A variant can carry multiple pricing tiers per supplier — keep the
      // lowest positive dealer price seen for that supplier.
      if (dealer != null && dealer > 0 && (existing == null || dealer < existing)) {
        prices.set(p.supplierId, dealer);
      } else if (!prices.has(p.supplierId)) {
        prices.set(p.supplierId, dealer);
      }
    }

    const suppliersWithPrice = Array.from(prices.entries()).filter(([, price]) => price != null && price > 0);
    if (suppliersWithPrice.length < 2) continue; // not "shared" across 2+ suppliers

    const sorted = [...suppliersWithPrice].sort((a, b) => (a[1] as number) - (b[1] as number));
    const cheapestSupplierId = sorted[0][0];
    const maxDiff = (sorted[sorted.length - 1][1] as number) - (sorted[0][1] as number);
    const hasConflict = maxDiff > 1; // $1+ spread between suppliers counts as a conflict worth reviewing

    rows.push({
      variantId: v.id,
      productName: product?.item ?? "—",
      variantLabel: variantLabel(v),
      category: product?.category ?? "",
      prices,
      cheapestSupplierId,
      hasConflict,
    });
  }

  return { suppliers, rows, sharedCount: rows.length };
}
