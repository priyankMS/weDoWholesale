import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export class DeliveryTimeSlot extends Model<
  InferAttributes<DeliveryTimeSlot>,
  InferCreationAttributes<DeliveryTimeSlot>
> {
  declare id: CreationOptional<number>;
  declare slotTiming: string;
  declare available: string | null;
  declare defaultSelected: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

DeliveryTimeSlot.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    slotTiming: { type: DataTypes.STRING(100), allowNull: false, field: "slot_timing" },
    available: { type: DataTypes.STRING(255), allowNull: true },
    defaultSelected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "default_selected",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "delivery_time_slot",
    modelName: "DeliveryTimeSlot",
  },
);
