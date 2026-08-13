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

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;

  // Step 1 — business info
  declare businessType: BusinessType;
  declare businessName: string;
  declare city: string;
  declare address: string;
  declare monthlyVolume: MonthlyVolume;

  // Step 2 — contact + credentials
  declare contactName: string;
  declare role: string;
  declare email: string;
  declare phone: string;
  declare passwordHash: string;

  declare status: CreationOptional<AccountStatus>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    businessType: {
      type: DataTypes.ENUM("restaurant", "grocery", "mosque", "catering"),
      allowNull: false,
    },
    businessName: { type: DataTypes.STRING(255), allowNull: false },
    city: { type: DataTypes.STRING(120), allowNull: false },
    address: { type: DataTypes.STRING(255), allowNull: false },
    monthlyVolume: {
      type: DataTypes.ENUM(
        "under_50kg",
        "50_100kg",
        "100_200kg",
        "200_500kg",
        "500kg_plus",
      ),
      allowNull: false,
    },
    contactName: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(40), allowNull: false },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    status: {
      type: DataTypes.ENUM("pending_review", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending_review",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "users",
    modelName: "User",
  },
);
