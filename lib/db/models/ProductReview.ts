import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Product } from "@/lib/db/models/Product";
import { User } from "@/lib/db/models/User";

export class ProductReview extends Model<
  InferAttributes<ProductReview>,
  InferCreationAttributes<ProductReview>
> {
  declare id: CreationOptional<number>;
  declare productId: number;
  declare userId: number | null;
  declare name: string;
  declare comment: string;
  declare image: string | null;
  declare rating: number;
  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
}

ProductReview.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productId: { type: DataTypes.INTEGER, allowNull: false, field: "product_id" },
    userId: { type: DataTypes.INTEGER, allowNull: true, field: "user_id" },
    name: { type: DataTypes.STRING(100), allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING(255), allowNull: true },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
  },
  {
    sequelize,
    tableName: "product_reviews",
    modelName: "ProductReview",
    updatedAt: false,
  },
);

Product.hasMany(ProductReview, { foreignKey: "productId" });
ProductReview.belongsTo(Product, { foreignKey: "productId" });
User.hasMany(ProductReview, { foreignKey: "userId" });
ProductReview.belongsTo(User, { foreignKey: "userId" });
