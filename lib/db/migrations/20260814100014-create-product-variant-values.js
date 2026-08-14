"use strict";

// Mirrors the client's existing `product_variant_values` join table
// (links a `product_variants` row to its `variant_values`, e.g. "this
// variant is Large + Bone-In").
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (
      (await queryInterface.showAllTables()).includes(
        "product_variant_values",
      )
    )
      return;
    await queryInterface.createTable("product_variant_values", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      productVariantId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "product_variants", key: "id" },
      },
      variantValueId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "variant_values", key: "id" },
      },
    });
    await queryInterface.addIndex("product_variant_values", [
      "productVariantId",
    ]);
    await queryInterface.addIndex("product_variant_values", [
      "variantValueId",
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("product_variant_values");
  },
};
