import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { User } from "@/lib/db/models/User";

export class PasswordReset extends Model<
  InferAttributes<PasswordReset>,
  InferCreationAttributes<PasswordReset>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare token: string;
  declare expiresAt: Date;
  declare usedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
}

PasswordReset.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    token: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    usedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "password_resets",
    modelName: "PasswordReset",
    updatedAt: false,
  },
);

User.hasMany(PasswordReset, { foreignKey: "userId" });
PasswordReset.belongsTo(User, { foreignKey: "userId" });
