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

export type PaymentMethod = "COD" | "Online";
export type PaymentStatus = "Pending" | "Failed" | "Completed";
export type OrderStatus =
  | "pending"
  | "new"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export class Order extends Model<
  InferAttributes<Order>,
  InferCreationAttributes<Order>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare orderNumber: string;
  declare totalAmount: number;
  declare discountAmount: CreationOptional<number | null>;
  declare shippingFee: CreationOptional<number | null>;
  declare shippingType: string | null;
  declare codCharges: CreationOptional<number>;
  declare finalAmount: number;
  declare paymentMethod: CreationOptional<PaymentMethod | null>;
  declare paymentStatus: PaymentStatus;
  declare orderStatus: CreationOptional<OrderStatus | null>;
  declare shippingAddressId: number | null;
  declare billingAddressId: number | null;
  declare timeSlot: string | null;
  declare deliveryDate: CreationOptional<string | null>;
  declare gstAmount: CreationOptional<number | null>;
  declare paymentOption: CreationOptional<string | null>;
  declare notes: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare paidAmount: number | null;
  declare isReorder: CreationOptional<boolean>;
  declare sourceOrderNumber: string | null;
  declare stripeSessionId: CreationOptional<string | null>;
  declare stripePaymentIntentId: CreationOptional<string | null>;
  declare receiptUrl: CreationOptional<string | null>;
  declare paidAt: CreationOptional<Date | null>;
  declare cardBrand: CreationOptional<string | null>;
  declare cardLast4: CreationOptional<string | null>;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
    orderNumber: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: "order_number" },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "total_amount" },
    discountAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0, field: "discount_amount" },
    shippingFee: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0, field: "shipping_fee" },
    shippingType: { type: DataTypes.STRING(20), allowNull: true, field: "shipping_type" },
    codCharges: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: "cod_charges" },
    finalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "final_amount" },
    paymentMethod: {
      type: DataTypes.ENUM("COD", "Online"),
      allowNull: true,
      defaultValue: "COD",
      field: "payment_method",
    },
    paymentStatus: {
      type: DataTypes.ENUM("Pending", "Failed", "Completed"),
      allowNull: false,
      field: "payment_status",
    },
    orderStatus: {
      type: DataTypes.ENUM("pending", "new", "shipped", "delivered", "cancelled", "returned"),
      allowNull: true,
      defaultValue: "pending",
      field: "order_status",
    },
    shippingAddressId: { type: DataTypes.INTEGER, allowNull: true, field: "shipping_address_id" },
    billingAddressId: { type: DataTypes.INTEGER, allowNull: true, field: "billing_address_id" },
    timeSlot: { type: DataTypes.STRING(50), allowNull: true, field: "time_slot" },
    deliveryDate: { type: DataTypes.DATEONLY, allowNull: true, field: "delivery_date" },
    gstAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0, field: "gst_amount" },
    paymentOption: { type: DataTypes.STRING(30), allowNull: true, field: "payment_option" },
    notes: { type: DataTypes.TEXT, allowNull: true },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
    paidAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: "paid_amount" },
    isReorder: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "is_reorder" },
    sourceOrderNumber: { type: DataTypes.STRING(100), allowNull: true, field: "source_order_number" },
    stripeSessionId: { type: DataTypes.STRING(255), allowNull: true, field: "stripe_session_id" },
    stripePaymentIntentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "stripe_payment_intent_id",
    },
    receiptUrl: { type: DataTypes.STRING(500), allowNull: true, field: "receipt_url" },
    paidAt: { type: DataTypes.DATE, allowNull: true, field: "paid_at" },
    cardBrand: { type: DataTypes.STRING(30), allowNull: true, field: "card_brand" },
    cardLast4: { type: DataTypes.STRING(4), allowNull: true, field: "card_last4" },
  },
  {
    sequelize,
    tableName: "orders",
    modelName: "Order",
  },
);

// Admin Orders screen needs the customer's business/contact name per order
// (getAdminOrderDetail / listAdminOrders in lib/db/queries/adminOrders.ts)
// — the wholesale checkout flow itself only ever looks up Order by userId
// directly, so this association wasn't needed until now.
safeAssociate(() => {
  User.hasMany(Order, { foreignKey: "userId" });
  Order.belongsTo(User, { foreignKey: "userId" });
});
