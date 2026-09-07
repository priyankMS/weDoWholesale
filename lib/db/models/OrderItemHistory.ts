import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type OrderItemAction = "added" | "updated" | "removed";

// Audit log of line-item add/update/remove actions with a before/after
// snapshot — the mechanism behind "ordered vs. picked-up weight" revision
// tracking in the wholesale portal mockups.
export class OrderItemHistory extends Model<
  InferAttributes<OrderItemHistory>,
  InferCreationAttributes<OrderItemHistory>
> {
  declare id: CreationOptional<number>;
  declare orderId: number;
  declare action: OrderItemAction;
  declare productName: string;
  declare sku: CreationOptional<string | null>;
  declare snapshotBefore: string | null;
  declare snapshotAfter: string | null;
  declare createdAt: CreationOptional<Date>;
  // Reliable per-line linkage for the revision engine (addOrderItem /
  // updateOrderItem in adminOrders.ts) — the orderId+productName matching
  // above breaks once an item is substituted to a different product.
  // Deliberately no FK: rows are never hard-deleted, so this never dangles,
  // but a loose column avoids blocking any future cleanup. Old rows (before
  // this column existed) stay null and keep using the productName match.
  declare orderItemId: CreationOptional<number | null>;
}

OrderItemHistory.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false, field: "order_id" },
    action: { type: DataTypes.ENUM("added", "updated", "removed"), allowNull: false },
    productName: { type: DataTypes.STRING(255), allowNull: false, field: "product_name" },
    sku: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "" },
    snapshotBefore: { type: DataTypes.TEXT("long"), allowNull: true, field: "snapshot_before" },
    snapshotAfter: { type: DataTypes.TEXT("long"), allowNull: true, field: "snapshot_after" },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
    orderItemId: { type: DataTypes.INTEGER, allowNull: true, field: "order_item_id" },
  },
  {
    sequelize,
    tableName: "order_item_history",
    modelName: "OrderItemHistory",
    updatedAt: false,
  },
);
