"use strict";

// Mirrors the client's existing `delivery_type` table (e.g. Standard,
// Express — each with its own charge).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("delivery_type"))
      return;
    await queryInterface.createTable("delivery_type", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      typeName: { type: Sequelize.STRING(50), allowNull: false },
      charges: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("delivery_type");
  },
};
