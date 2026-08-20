"use strict";

// Phase 4's "Notification preferences" screen (WhatsApp / Email /
// Promotional toggles) needs somewhere to persist per-user choices — no
// existing table covers this. One row per user, created on first read with
// the mockup's own defaults (see NotificationPreference.ts).

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notification_preferences", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      // Signed to match the real `users.id` column (not UNSIGNED) — same
      // note as saved_products/password_resets.
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "user_id",
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      waOrderConfirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "wa_order_confirmed",
      },
      waOrderDispatched: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "wa_order_dispatched",
      },
      waSubstitutionAlerts: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "wa_substitution_alerts",
      },
      waLowStock: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "wa_low_stock",
      },
      emailOrderConfirmation: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "email_order_confirmation",
      },
      emailInvoice: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "email_invoice",
      },
      emailMonthlyStatement: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "email_monthly_statement",
      },
      emailPaymentDueReminders: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "email_payment_due_reminders",
      },
      promoNewProducts: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "promo_new_products",
      },
      promoEidSeasonal: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "promo_eid_seasonal",
      },
      promoPriceChanges: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "promo_price_changes",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: "created_at" },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: "updated_at" },
    });

    await queryInterface.addConstraint("notification_preferences", {
      fields: ["user_id"],
      type: "unique",
      name: "notification_preferences_user_id_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("notification_preferences");
  },
};
