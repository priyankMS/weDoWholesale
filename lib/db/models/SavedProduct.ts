import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { User } from "@/lib/db/models/User";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { safeAssociate } from "@/lib/db/associate";

// Per-user wishlist ("Saved") for Phase 2 — Discovery and Browsing. Didn't
// exist before this phase; the wdh_* product schema has no per-user state.
export class SavedProduct extends Model<
  InferAttributes<SavedProduct>,
  InferCreationAttributes<SavedProduct>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare productId: number;
  declare createdAt: CreationOptional<Date>;
}

SavedProduct.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    // Signed to match the real `users.id` column (see PasswordReset.ts).
    userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
    productId: { type: DataTypes.INTEGER, allowNull: false, field: "product_id" },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
  },
  {
    sequelize,
    tableName: "saved_products",
    modelName: "SavedProduct",
    updatedAt: false,
  },
);

safeAssociate(() => {
  User.hasMany(SavedProduct, { foreignKey: "userId" });
  SavedProduct.belongsTo(User, { foreignKey: "userId" });
  WdhProduct.hasMany(SavedProduct, { foreignKey: "productId" });
  SavedProduct.belongsTo(WdhProduct, { foreignKey: "productId" });
});
