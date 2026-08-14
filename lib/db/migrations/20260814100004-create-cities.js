"use strict";

// Mirrors the client's existing `cities` table (delivery-area city list).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("cities")) return;
    await queryInterface.createTable("cities", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("cities");
  },
};
