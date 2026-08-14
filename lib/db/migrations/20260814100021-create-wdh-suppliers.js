"use strict";

// Mirrors the client's existing `wdh_suppliers` table.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("wdh_suppliers"))
      return;
    await queryInterface.createTable("wdh_suppliers", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      sort_order: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      is_active: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("wdh_suppliers");
  },
};
