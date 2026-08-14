"use strict";

// Mirrors the client's existing `product_variants` table (the older,
// generic EAV-style variant system — superseded for wholesale by
// `wdh_variants`, but still referenced by `product_variant_values`).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("product_variants"))
      return;
    await queryInterface.createTable("product_variants", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "products", key: "id" },
      },
      sku: { type: Sequelize.STRING(100), allowNull: true },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      stock: { type: Sequelize.INTEGER, allowNull: true },
    });
    await queryInterface.addIndex("product_variants", ["productId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("product_variants");
  },
};
