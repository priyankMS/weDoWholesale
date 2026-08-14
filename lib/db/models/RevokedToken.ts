import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

// Session-JWT blocklist. Storing the token's `jti` (not the token itself)
// lets us revoke a single active session on logout without needing to
// track every issued token — only the ones explicitly revoked before
// their natural expiry.
export class RevokedToken extends Model<
  InferAttributes<RevokedToken>,
  InferCreationAttributes<RevokedToken>
> {
  declare id: CreationOptional<number>;
  declare jti: string;
  declare expiresAt: Date;
  declare createdAt: CreationOptional<Date>;
}

RevokedToken.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    jti: { type: DataTypes.STRING(36), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "revoked_tokens",
    modelName: "RevokedToken",
    updatedAt: false,
  },
);
