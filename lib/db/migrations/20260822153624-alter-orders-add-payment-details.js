"use strict";

// Stripe transaction detail, captured by the checkout webhook once payment
// is confirmed — needed so account/admin can show transaction info and a
// downloadable receipt link (Stripe's hosted receipt_url) per order.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("orders", "stripe_session_id", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("orders", "stripe_payment_intent_id", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("orders", "receipt_url", {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn("orders", "paid_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("orders", "card_brand", {
      type: Sequelize.STRING(30),
      allowNull: true,
    });
    await queryInterface.addColumn("orders", "card_last4", {
      type: Sequelize.STRING(4),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("orders", "stripe_session_id");
    await queryInterface.removeColumn("orders", "stripe_payment_intent_id");
    await queryInterface.removeColumn("orders", "receipt_url");
    await queryInterface.removeColumn("orders", "paid_at");
    await queryInterface.removeColumn("orders", "card_brand");
    await queryInterface.removeColumn("orders", "card_last4");
  },
};
