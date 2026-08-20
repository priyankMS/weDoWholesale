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
  // Wholesale-specific — added for Phase 4 (Account Management)'s
  // "Delivery addresses" screen (e.g. "Main kitchen", "Catering unit").
  declare label: CreationOptional<string | null>;
  declare isDefault: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
}

Address.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: true },
    // Widened from the original VARCHAR(12) — see
    // 20260819170001-alter-address-widen-mobile.js.
    mobile: { type: DataTypes.STRING(40), allowNull: true },
    email: { type: DataTypes.STRING(100), allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
    address: { type: DataTypes.TEXT, allowNull: true },
    zipCode: { type: DataTypes.TEXT, allowNull: true, field: "zip_code" },
    city: { type: DataTypes.TEXT, allowNull: true },
    country: { type: DataTypes.TEXT, allowNull: true },
    label: { type: DataTypes.STRING(120), allowNull: true },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_default",
    },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
  },
  {
    sequelize,
    tableName: "address",
    modelName: "Address",
    updatedAt: false,
  },
);
