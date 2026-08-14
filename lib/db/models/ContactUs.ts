import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export class ContactUs extends Model<
  InferAttributes<ContactUs>,
  InferCreationAttributes<ContactUs>
> {
  declare id: CreationOptional<number>;
  declare name: string | null;
  declare email: string | null;
  declare subject: string | null;
  declare phone: string | null;
  declare message: string | null;
  declare createdAt: CreationOptional<Date>;
}

ContactUs.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: true },
    email: { type: DataTypes.STRING(100), allowNull: true },
    subject: { type: DataTypes.STRING(255), allowNull: true },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: true },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
  },
  {
    sequelize,
    tableName: "contactus",
    modelName: "ContactUs",
    updatedAt: false,
  },
);
