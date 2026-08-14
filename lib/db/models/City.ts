import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export class City extends Model<
  InferAttributes<City>,
  InferCreationAttributes<City>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare isActive: CreationOptional<boolean>;
  declare isDeleted: CreationOptional<boolean>;
}

City.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    isDeleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    sequelize,
    tableName: "cities",
    modelName: "City",
    timestamps: false,
  },
);
