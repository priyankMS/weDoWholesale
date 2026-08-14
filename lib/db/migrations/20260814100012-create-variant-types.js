"use strict";

// Mirrors the client's existing `variant_types` table (e.g. "Size", "Cut").
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("variant_types"))
      return;
    await queryInterface.createTable("variant_types", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("variant_types");
  },
};
