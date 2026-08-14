"use strict";

// Mirrors the client's existing `orders` table (shared order header
// between retail and — eventually — wholesale checkout).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("orders")) return;
    await queryInterface.createTable("orders", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false },
      order_number: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      discount_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
      shipping_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
      shipping_type: { type: Sequelize.STRING(20), allowNull: true },
      cod_charges: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      final_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      payment_method: {
        type: Sequelize.ENUM("COD", "Online"),
        allowNull: true,
        defaultValue: "COD",
      },
      payment_status: {
        type: Sequelize.ENUM("Pending", "Failed", "Completed"),
        allowNull: false,
      },
      order_status: {
        type: Sequelize.ENUM(
          "pending",
          "new",
          "shipped",
          "delivered",
          "cancelled",
          "returned",
        ),
        allowNull: true,
        defaultValue: "pending",
      },
      shipping_address_id: { type: Sequelize.INTEGER, allowNull: true },
      billing_address_id: { type: Sequelize.INTEGER, allowNull: true },
      time_slot: { type: Sequelize.STRING(50), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      paid_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      is_reorder: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      source_order_number: { type: Sequelize.STRING(100), allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("orders");
  },
};
