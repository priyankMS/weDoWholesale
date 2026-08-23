import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { VariantType } from "@/lib/db/models/VariantType";
import { safeAssociate } from "@/lib/db/associate";

// e.g. "Large", "Bone-In" — a specific value belonging to a VariantType.
export class VariantValue extends Model<
  InferAttributes<VariantValue>,
  InferCreationAttributes<VariantValue>
> {
  declare id: CreationOptional<number>;
  declare variantTypeId: number | null;
  declare value: string | null;
}

VariantValue.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    variantTypeId: { type: DataTypes.INTEGER, allowNull: true },
    value: { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    sequelize,
    tableName: "variant_values",
    modelName: "VariantValue",
    timestamps: false,
  },
);

safeAssociate(() => {
  VariantType.hasMany(VariantValue, { foreignKey: "variantTypeId" });
  VariantValue.belongsTo(VariantType, { foreignKey: "variantTypeId" });
});
