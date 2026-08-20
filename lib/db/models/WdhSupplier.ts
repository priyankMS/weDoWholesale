import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export class WdhSupplier extends Model<
  InferAttributes<WdhSupplier>,
  InferCreationAttributes<WdhSupplier>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare sortOrder: CreationOptional<number>;
  declare isActive: CreationOptional<boolean>;
  declare contactName: CreationOptional<string | null>;
  declare phone: CreationOptional<string | null>;
  declare email: CreationOptional<string | null>;
  declare paymentTerms: CreationOptional<string | null>;
  declare halalCertStatus: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

WdhSupplier.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    sortOrder: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0, field: "sort_order" },
    isActive: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true, field: "is_active" },
    contactName: { type: DataTypes.STRING(255), allowNull: true, field: "contact_name" },
    phone: { type: DataTypes.STRING(40), allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: true },
    paymentTerms: { type: DataTypes.STRING(50), allowNull: true, field: "payment_terms" },
    halalCertStatus: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: "Certified",
      field: "halal_cert_status",
    },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
  },
  {
    sequelize,
    tableName: "wdh_suppliers",
    modelName: "WdhSupplier",
  },
);
