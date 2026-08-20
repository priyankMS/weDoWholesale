import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { User } from "@/lib/db/models/User";

// One row per user — Phase 4 (Account Management)'s "Notification
// preferences" screen. Didn't exist before this phase; created lazily
// (see lib/db/queries/account.ts) with the mockup's own defaults the first
// time a user's preferences are read.
export class NotificationPreference extends Model<
  InferAttributes<NotificationPreference>,
  InferCreationAttributes<NotificationPreference>
> {
  declare id: CreationOptional<number>;
  declare userId: number;

  declare waOrderConfirmed: CreationOptional<boolean>;
  declare waOrderDispatched: CreationOptional<boolean>;
  declare waSubstitutionAlerts: CreationOptional<boolean>;
  declare waLowStock: CreationOptional<boolean>;

  declare emailOrderConfirmation: CreationOptional<boolean>;
  declare emailInvoice: CreationOptional<boolean>;
  declare emailMonthlyStatement: CreationOptional<boolean>;
  declare emailPaymentDueReminders: CreationOptional<boolean>;

  declare promoNewProducts: CreationOptional<boolean>;
  declare promoEidSeasonal: CreationOptional<boolean>;
  declare promoPriceChanges: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

NotificationPreference.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },

    waOrderConfirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "wa_order_confirmed",
    },
    waOrderDispatched: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "wa_order_dispatched",
    },
    waSubstitutionAlerts: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "wa_substitution_alerts",
    },
    waLowStock: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "wa_low_stock",
    },

    emailOrderConfirmation: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "email_order_confirmation",
    },
    emailInvoice: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "email_invoice",
    },
    emailMonthlyStatement: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "email_monthly_statement",
    },
    emailPaymentDueReminders: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "email_payment_due_reminders",
    },

    promoNewProducts: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "promo_new_products",
    },
    promoEidSeasonal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "promo_eid_seasonal",
    },
    promoPriceChanges: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "promo_price_changes",
    },

    createdAt: { type: DataTypes.DATE, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
  },
  {
    sequelize,
    tableName: "notification_preferences",
    modelName: "NotificationPreference",
  },
);

User.hasOne(NotificationPreference, { foreignKey: "userId" });
NotificationPreference.belongsTo(User, { foreignKey: "userId" });
