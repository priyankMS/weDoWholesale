import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

// One row per Stripe event received at /api/webhooks/stripe — `eventId` is
// unique so Stripe's at-least-once redelivery just no-ops on the second
// insert attempt instead of double-logging. Rows older than 15 days are
// purged by /api/cron/cleanup-webhook-logs (see lib/db/queries/stripeWebhookLogs.ts).
export class StripeWebhookLog extends Model<
  InferAttributes<StripeWebhookLog>,
  InferCreationAttributes<StripeWebhookLog>
> {
  declare id: CreationOptional<number>;
  declare eventId: string;
  declare eventType: string;
  declare status: "processed" | "ignored" | "error";
  declare orderNumber: CreationOptional<string | null>;
  declare errorMessage: CreationOptional<string | null>;
  declare payload: CreationOptional<object | null>;
  declare createdAt: CreationOptional<Date>;
}

StripeWebhookLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    eventId: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    eventType: { type: DataTypes.STRING(255), allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false },
    orderNumber: { type: DataTypes.STRING(50), allowNull: true },
    errorMessage: { type: DataTypes.TEXT, allowNull: true },
    payload: { type: DataTypes.JSON, allowNull: true },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "stripe_webhook_logs",
    modelName: "StripeWebhookLog",
    updatedAt: false,
  },
);
