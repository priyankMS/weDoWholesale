import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export class Category extends Model<
  InferAttributes<Category>,
  InferCreationAttributes<Category>
> {
  declare id: CreationOptional<number>;
  declare name: string | null;
  declare slug: string | null;
  declare image: string | null;
  declare isActive: CreationOptional<boolean>;
}

Category.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: true },
    slug: { type: DataTypes.STRING(100), allowNull: true, unique: true },
    image: { type: DataTypes.STRING(255), allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
  },
  {
    sequelize,
    tableName: "categories",
    modelName: "Category",
    timestamps: false,
  },
);
