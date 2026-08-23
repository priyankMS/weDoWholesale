import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { User } from "@/lib/db/models/User";
import { safeAssociate } from "@/lib/db/associate";

export class PasswordReset extends Model<
  InferAttributes<PasswordReset>,
  InferCreationAttributes<PasswordReset>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  // SHA-256 hash of the reset token — never store the raw token, so a
  // database leak alone can't be used to take over accounts.
  declare tokenHash: string;
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
    tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
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

safeAssociate(() => {
  User.hasMany(PasswordReset, { foreignKey: "userId" });
  PasswordReset.belongsTo(User, { foreignKey: "userId" });
});
