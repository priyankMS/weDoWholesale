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
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

WdhSupplier.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    sortOrder: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0, field: "sort_order" },
    isActive: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true, field: "is_active" },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
  },
  {
    sequelize,
    tableName: "wdh_suppliers",
    modelName: "WdhSupplier",
  },
);
