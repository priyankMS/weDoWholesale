"use strict";

// Mirrors the client's existing `product_attributes` table (generic
// name/value pairs attached to a `products` row).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("product_attributes"))
      return;
    await queryInterface.createTable("product_attributes", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "products", key: "id" },
      },
      name: { type: Sequelize.STRING(100), allowNull: true },
      value: { type: Sequelize.STRING(255), allowNull: true },
    });
    await queryInterface.addIndex("product_attributes", ["productId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("product_attributes");
  },
};
