"use strict";

// Mirrors the client's existing `order_items` table (line items on an
// `orders` row).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("order_items"))
      return;
    await queryInterface.createTable("order_items", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "orders", key: "id" },
        onDelete: "CASCADE",
      },
      product_id: { type: Sequelize.INTEGER, allowNull: false },
      sku: { type: Sequelize.STRING(100), allowNull: true },
      product_name: { type: Sequelize.STRING(255), allowNull: true },
      quantity: { type: Sequelize.DECIMAL(10, 3), allowNull: false, defaultValue: 1 },
      unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    });
    await queryInterface.addIndex("order_items", ["order_id"]);
    await queryInterface.addIndex("order_items", ["product_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("order_items");
  },
};
