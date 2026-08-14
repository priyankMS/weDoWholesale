import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

// Generic type/value lookup list — e.g. filter facet options for Phase 2
// Discovery (condition types, slaughter methods, etc.).
export class WdhOption extends Model<
  InferAttributes<WdhOption>,
  InferCreationAttributes<WdhOption>
> {
  declare id: CreationOptional<number>;
  declare type: string;
  declare value: string;
  declare sortOrder: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
}

WdhOption.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    type: { type: DataTypes.STRING(50), allowNull: false },
    value: { type: DataTypes.STRING(255), allowNull: false },
    sortOrder: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0, field: "sort_order" },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
  },
  {
    sequelize,
    tableName: "wdh_options",
    modelName: "WdhOption",
    updatedAt: false,
  },
);
