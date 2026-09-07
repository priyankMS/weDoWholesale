import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Order } from "@/lib/db/models/Order";
import { safeAssociate } from "@/lib/db/associate";

export class OrderItem extends Model<
  InferAttributes<OrderItem>,
  InferCreationAttributes<OrderItem>
> {
  declare id: CreationOptional<number>;
  declare orderId: number;
  declare productId: number;
  declare variantId: CreationOptional<number | null>;
  declare sku: string | null;
  declare productName: string | null;
  declare quantity: CreationOptional<number>;
  declare unitPrice: number;
  declare totalPrice: number;
  // Snapshotted from WdhProduct.category / WdhVariant.conditionType at
  // add-time (same reasoning as productName/sku above) — used by the
  // revision invoice's Category/Condition columns.
  declare category: CreationOptional<string | null>;
  declare conditionType: CreationOptional<string | null>;
  // Snapshotted at add-time from catalogue.ts's unitFor() (kg/lb/pack/unit)
  // — same reasoning as category/conditionType above.
  declare unit: CreationOptional<string | null>;
}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false, field: "order_id" },
    productId: { type: DataTypes.INTEGER, allowNull: false, field: "product_id" },
    variantId: { type: DataTypes.INTEGER, allowNull: true, field: "variant_id" },
    sku: { type: DataTypes.STRING(100), allowNull: true },
    productName: { type: DataTypes.STRING(255), allowNull: true, field: "product_name" },
    quantity: { type: DataTypes.DECIMAL(10, 3), allowNull: false, defaultValue: 1 },
    unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "unit_price" },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "total_price" },
    category: { type: DataTypes.STRING(100), allowNull: true },
    conditionType: { type: DataTypes.STRING(50), allowNull: true, field: "condition_type" },
    unit: { type: DataTypes.STRING(20), allowNull: true },
  },
  {
    sequelize,
    tableName: "order_items",
    modelName: "OrderItem",
    timestamps: false,
  },
);

safeAssociate(() => {
  Order.hasMany(OrderItem, { foreignKey: "orderId" });
  OrderItem.belongsTo(Order, { foreignKey: "orderId" });
});
