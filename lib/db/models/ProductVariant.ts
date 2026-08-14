import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Product } from "@/lib/db/models/Product";

// The older, generic EAV-style variant system — superseded for wholesale
// by wdh_variants, but still referenced by ProductVariantValue.
export class ProductVariant extends Model<
  InferAttributes<ProductVariant>,
  InferCreationAttributes<ProductVariant>
> {
  declare id: CreationOptional<number>;
  declare productId: number | null;
  declare sku: string | null;
  declare price: number | null;
  declare stock: number | null;
}

ProductVariant.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productId: { type: DataTypes.INTEGER, allowNull: true },
    sku: { type: DataTypes.STRING(100), allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    stock: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    tableName: "product_variants",
    modelName: "ProductVariant",
    timestamps: false,
  },
);

Product.hasMany(ProductVariant, { foreignKey: "productId" });
ProductVariant.belongsTo(Product, { foreignKey: "productId" });
