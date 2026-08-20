import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

// Admin-configurable platform settings (Master Admin → Settings). Flat
// key/value table — every current setting is numeric, cast at read time
// by the code that consumes it.
export class PlatformSetting extends Model<
  InferAttributes<PlatformSetting>,
  InferCreationAttributes<PlatformSetting>
> {
  declare key: string;
  declare value: string;
  declare updatedAt: CreationOptional<Date>;
}

PlatformSetting.init(
  {
    key: { type: DataTypes.STRING(100), primaryKey: true },
    value: { type: DataTypes.STRING(255), allowNull: false },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
  },
  {
    sequelize,
    tableName: "platform_settings",
    modelName: "PlatformSetting",
    createdAt: false,
  },
);
