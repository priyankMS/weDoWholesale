import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export class DeliveryType extends Model<
  InferAttributes<DeliveryType>,
  InferCreationAttributes<DeliveryType>
> {
  declare id: CreationOptional<number>;
  declare typeName: string;
  declare charges: CreationOptional<number>;
  declare isActive: CreationOptional<boolean>;
}

DeliveryType.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    typeName: { type: DataTypes.STRING(50), allowNull: false },
    charges: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    tableName: "delivery_type",
    modelName: "DeliveryType",
    timestamps: false,
  },
);
