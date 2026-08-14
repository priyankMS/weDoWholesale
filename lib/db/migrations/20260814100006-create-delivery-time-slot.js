"use strict";

// Mirrors the client's existing `delivery_time_slot` table.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("delivery_time_slot"))
      return;
    await queryInterface.createTable("delivery_time_slot", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      slot_timing: { type: Sequelize.STRING(100), allowNull: false },
      available: { type: Sequelize.STRING(255), allowNull: true },
      default_selected: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("delivery_time_slot");
  },
};
