import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type BusinessType = "restaurant" | "grocery" | "mosque" | "catering";
export type MonthlyVolume =
  | "under_50kg"
  | "50_100kg"
  | "100_200kg"
  | "200_500kg"
  | "500kg_plus";
export type AccountStatus = "pending_review" | "approved" | "rejected";

// Maps onto the client's existing `users` table — imported from their
// production retail-site backup (67 real accounts). `userName` / `email` /
// `passwordHash` / `isActive` are their pre-existing columns (note the
// snake_case DB names below); everything from `businessType` down was added
// by migration 20260814120000-alter-users-add-wholesale-fields specifically
// for the wholesale portal, so it's nullable — most existing rows won't
// have it set.
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare userName: string | null;
  declare email: string;
  declare passwordHash: string;
  declare isActive: CreationOptional<boolean>;

  // Wholesale-specific — business info
  declare businessType: BusinessType | null;
  declare businessName: string | null;
  declare city: string | null;
  declare businessAddress: string | null;
  declare monthlyVolume: MonthlyVolume | null;

  // Wholesale-specific — contact
  declare contactName: string | null;
  declare role: string | null;
  declare phone: string | null;

  declare status: CreationOptional<AccountStatus>;

  // Security
  declare tokenVersion: CreationOptional<number>;
  declare failedLoginAttempts: CreationOptional<number>;
  declare lockedUntil: CreationOptional<Date | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER, // signed int(11) — matches the real column
      autoIncrement: true,
      primaryKey: true,
    },
    userName: { type: DataTypes.STRING(500), allowNull: true, field: "user_name" },
    email: { type: DataTypes.STRING(500), allowNull: false },
    passwordHash: { type: DataTypes.STRING(500), allowNull: false, field: "password" },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },

    businessType: {
      type: DataTypes.ENUM("restaurant", "grocery", "mosque", "catering"),
      allowNull: true,
      field: "business_type",
    },
    businessName: { type: DataTypes.STRING(255), allowNull: true, field: "business_name" },
    city: { type: DataTypes.STRING(120), allowNull: true },
    businessAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "business_address",
    },
    monthlyVolume: {
      type: DataTypes.ENUM(
        "under_50kg",
        "50_100kg",
        "100_200kg",
        "200_500kg",
        "500kg_plus",
      ),
      allowNull: true,
      field: "monthly_volume",
    },
    contactName: { type: DataTypes.STRING(255), allowNull: true, field: "contact_name" },
    role: { type: DataTypes.STRING(120), allowNull: true },
    phone: { type: DataTypes.STRING(40), allowNull: true },

    status: {
      type: DataTypes.ENUM("pending_review", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending_review",
    },
    tokenVersion: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: "token_version",
    },
    failedLoginAttempts: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: "failed_login_attempts",
    },
    lockedUntil: { type: DataTypes.DATE, allowNull: true, field: "locked_until" },
    createdAt: { type: DataTypes.DATE, field: "create_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
  },
  {
    sequelize,
    tableName: "users",
    modelName: "User",
  },
);
