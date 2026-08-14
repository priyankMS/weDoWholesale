import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

// e.g. "Size", "Cut" — the type a VariantValue belongs to.
export class VariantType extends Model<
  InferAttributes<VariantType>,
  InferCreationAttributes<VariantType>
> {
  declare id: CreationOptional<number>;
  declare name: string | null;
}

VariantType.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    sequelize,
    tableName: "variant_types",
    modelName: "VariantType",
    timestamps: false,
  },
);
