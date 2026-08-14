import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

// Customer delivery addresses (retail site).
export class Address extends Model<
  InferAttributes<Address>,
  InferCreationAttributes<Address>
> {
  declare id: CreationOptional<number>;
  declare name: string | null;
  declare mobile: string | null;
  declare email: string | null;
  declare userId: number;
  declare address: string | null;
  declare zipCode: string | null;
  declare city: string | null;
  declare country: string | null;
  declare createdAt: CreationOptional<Date>;
}

Address.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: true },
    mobile: { type: DataTypes.STRING(12), allowNull: true },
    email: { type: DataTypes.STRING(100), allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
    address: { type: DataTypes.TEXT, allowNull: true },
    zipCode: { type: DataTypes.TEXT, allowNull: true, field: "zip_code" },
    city: { type: DataTypes.TEXT, allowNull: true },
    country: { type: DataTypes.TEXT, allowNull: true },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
  },
  {
    sequelize,
    tableName: "address",
    modelName: "Address",
    updatedAt: false,
  },
);
