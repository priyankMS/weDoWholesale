import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { AdminUser } from "@/lib/db/models/AdminUser";
import { safeAssociate } from "@/lib/db/associate";

// Mirrors PasswordReset.ts for the wholesale-portal `users` table, scoped
// to AdminUser instead — a completely separate login system, so it needs
// its own reset table rather than sharing one.
export class AdminPasswordReset extends Model<
  InferAttributes<AdminPasswordReset>,
  InferCreationAttributes<AdminPasswordReset>
> {
  declare id: CreationOptional<number>;
  declare adminId: number;
  // SHA-256 hash of the reset token — never store the raw token, so a
  // database leak alone can't be used to take over accounts.
  declare tokenHash: string;
  declare expiresAt: Date;
  declare usedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
}

AdminPasswordReset.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    adminId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    usedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "admin_password_resets",
    modelName: "AdminPasswordReset",
    updatedAt: false,
  },
);

safeAssociate(() => {
  AdminUser.hasMany(AdminPasswordReset, { foreignKey: "adminId" });
  AdminPasswordReset.belongsTo(AdminUser, { foreignKey: "adminId" });
});
