import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type ProductStockStatus = "in_stock" | "out_of_stock" | "preorder";

// The `products` table — an early, mostly-empty product table superseded
// by `products_new` and then `wdh_products`. Kept because
// ProductAttribute/ProductVariant/ProductReview still reference it.
export class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare title: string;
  declare description: string | null;
  declare shortDescription: string | null;
  declare thumbnail: string | null;
  declare images: string | null;
  declare basePrice: CreationOptional<number | null>;
  declare discountPrice: number | null;
  declare isFeatured: CreationOptional<boolean>;
  declare isActive: CreationOptional<boolean>;
  declare stockStatus: CreationOptional<ProductStockStatus>;
  declare sku: string | null;
  declare metaTitle: string | null;
  declare metaDescription: string | null;
  declare tags: string | null;
  declare rating: CreationOptional<number>;
  declare totalReviews: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    title: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    shortDescription: { type: DataTypes.TEXT, allowNull: true },
    thumbnail: { type: DataTypes.STRING(255), allowNull: true },
    images: { type: DataTypes.TEXT("long"), allowNull: true },
    basePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
    discountPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    isFeatured: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
    stockStatus: {
      type: DataTypes.ENUM("in_stock", "out_of_stock", "preorder"),
      allowNull: true,
      defaultValue: "in_stock",
    },
    sku: { type: DataTypes.STRING(100), allowNull: true },
    metaTitle: { type: DataTypes.STRING(255), allowNull: true },
    metaDescription: { type: DataTypes.TEXT, allowNull: true },
    tags: { type: DataTypes.STRING(255), allowNull: true },
    rating: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    totalReviews: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "products",
    modelName: "Product",
  },
);
