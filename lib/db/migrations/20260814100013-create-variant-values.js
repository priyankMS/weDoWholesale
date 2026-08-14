"use strict";

// Mirrors the client's existing `variant_values` table (e.g. "Large",
// "Bone-In" — values belonging to a `variant_types` row).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("variant_values"))
      return;
    await queryInterface.createTable("variant_values", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      variantTypeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "variant_types", key: "id" },
      },
      value: { type: Sequelize.STRING(100), allowNull: true },
    });
    await queryInterface.addIndex("variant_values", ["variantTypeId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("variant_values");
  },
};
