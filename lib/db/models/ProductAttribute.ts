import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Product } from "@/lib/db/models/Product";

export class ProductAttribute extends Model<
  InferAttributes<ProductAttribute>,
  InferCreationAttributes<ProductAttribute>
> {
  declare id: CreationOptional<number>;
  declare productId: number | null;
  declare name: string | null;
  declare value: string | null;
}

ProductAttribute.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productId: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING(100), allowNull: true },
    value: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    sequelize,
    tableName: "product_attributes",
    modelName: "ProductAttribute",
    timestamps: false,
  },
);

Product.hasMany(ProductAttribute, { foreignKey: "productId" });
ProductAttribute.belongsTo(Product, { foreignKey: "productId" });
