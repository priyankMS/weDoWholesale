import { Op } from "sequelize";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { Order } from "@/lib/db/models/Order";

export type SupplierStatusRow = {
  id: number;
  name: string;
  productCount: number;
  isActive: boolean;
};

export type AdminDashboardStats = {
  totalProducts: number;
  totalVariants: number;
  activeSuppliers: number;
  totalSuppliers: number;
  liveOrders: number;
  missingSeo: number;
  supplierStatus: SupplierStatusRow[];
};

// Real, DB-derived numbers only — the Dropbox mockup's "4m ago" activity
// feed and week-over-week deltas need an activity-log table that doesn't
// exist yet, so those are left out of phase 1 rather than faked.
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [totalProducts, totalVariants, suppliers, liveOrders, missingSeo, pricingRows] =
    await Promise.all([
      WdhProduct.count(),
      WdhVariant.count(),
      WdhSupplier.findAll({ order: [["sortOrder", "ASC"]] }),
      Order.count({ where: { orderStatus: { [Op.in]: ["pending", "new", "shipped"] } } }),
      WdhProduct.count({
        where: {
          [Op.or]: [{ metaDesc: null }, { metaDesc: "" }],
        },
      }),
      WdhVariantPricing.findAll({ attributes: ["supplierId", "variantId"] }),
    ]);

  // Distinct variants priced by each supplier, not raw pricing rows — a
  // variant can carry multiple pricing tiers for the same supplier.
  const productCountBySupplier = new Map<number, Set<number>>();
  for (const row of pricingRows) {
    if (row.supplierId == null) continue;
    if (!productCountBySupplier.has(row.supplierId)) {
      productCountBySupplier.set(row.supplierId, new Set());
    }
    productCountBySupplier.get(row.supplierId)!.add(row.variantId);
  }

  const supplierStatus: SupplierStatusRow[] = suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    productCount: productCountBySupplier.get(s.id)?.size ?? 0,
    isActive: s.isActive,
  }));

  return {
    totalProducts,
    totalVariants,
    activeSuppliers: suppliers.filter((s) => s.isActive).length,
    totalSuppliers: suppliers.length,
    liveOrders,
    missingSeo,
    supplierStatus,
  };
}
