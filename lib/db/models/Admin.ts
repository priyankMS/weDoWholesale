import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

// Retail-site admin panel logins — separate from customer/wholesale `users`.
export class Admin extends Model<
  InferAttributes<Admin>,
  InferCreationAttributes<Admin>
> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare contact: string;
  declare email: string;
  declare password: string;
  declare address: string;
}

Admin.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(100), allowNull: false },
    contact: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false },
    password: { type: DataTypes.STRING(100), allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    tableName: "admin",
    modelName: "Admin",
    timestamps: false,
  },
);
