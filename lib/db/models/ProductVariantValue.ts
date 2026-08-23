import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { ProductVariant } from "@/lib/db/models/ProductVariant";
import { VariantValue } from "@/lib/db/models/VariantValue";
import { safeAssociate } from "@/lib/db/associate";

// Join table: links a ProductVariant to its VariantValues (e.g. "this
// variant is Large + Bone-In").
export class ProductVariantValue extends Model<
  InferAttributes<ProductVariantValue>,
  InferCreationAttributes<ProductVariantValue>
> {
  declare id: CreationOptional<number>;
  declare productVariantId: number | null;
  declare variantValueId: number | null;
}

ProductVariantValue.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productVariantId: { type: DataTypes.INTEGER, allowNull: true },
    variantValueId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    tableName: "product_variant_values",
    modelName: "ProductVariantValue",
    timestamps: false,
  },
);

safeAssociate(() => {
  ProductVariant.hasMany(ProductVariantValue, { foreignKey: "productVariantId" });
  ProductVariantValue.belongsTo(ProductVariant, { foreignKey: "productVariantId" });
  VariantValue.hasMany(ProductVariantValue, { foreignKey: "variantValueId" });
  ProductVariantValue.belongsTo(VariantValue, { foreignKey: "variantValueId" });
});
