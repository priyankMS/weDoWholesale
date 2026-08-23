import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";

// Per-supplier tiered pricing (dealer cost, increment, retail) for a
// WdhVariant — the wholesale tiered-pricing mechanism.
export class WdhVariantPricing extends Model<
  InferAttributes<WdhVariantPricing>,
  InferCreationAttributes<WdhVariantPricing>
> {
  declare id: CreationOptional<number>;
  declare variantId: number;
  declare supplierId: number | null;
  declare label: string;
  declare dealerPrice: number | null;
  // Named `priceIncrement` on the JS side — `increment` is a reserved
  // Sequelize Model instance method name. The real DB column is `increment`.
  declare priceIncrement: number | null;
  declare retailPrice: number | null;
  declare sortOrder: CreationOptional<number>;
}

WdhVariantPricing.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    variantId: { type: DataTypes.INTEGER, allowNull: false, field: "variant_id" },
    supplierId: { type: DataTypes.INTEGER, allowNull: true, field: "supplier_id" },
    label: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "" },
    dealerPrice: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "dealer_price" },
    priceIncrement: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "increment" },
    retailPrice: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "retail_price" },
    sortOrder: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0, field: "sort_order" },
  },
  {
    sequelize,
    tableName: "wdh_variant_pricing",
    modelName: "WdhVariantPricing",
    timestamps: false,
  },
);

// Guarded: dev HMR re-executes this module without restarting the
// process, and the long-lived WdhVariant/WdhSupplier classes would
// otherwise pick up a second association with the same alias on every
// reload — same fix as WdhVariant.ts's WdhProduct association.
if (!WdhVariant.associations.pricing) {
  WdhVariant.hasMany(WdhVariantPricing, { foreignKey: "variantId", as: "pricing" });
  WdhVariantPricing.belongsTo(WdhVariant, { foreignKey: "variantId" });
  WdhSupplier.hasMany(WdhVariantPricing, { foreignKey: "supplierId" });
  WdhVariantPricing.belongsTo(WdhSupplier, { foreignKey: "supplierId" });
}
