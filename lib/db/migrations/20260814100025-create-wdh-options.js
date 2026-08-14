"use strict";

// Mirrors the client's existing `wdh_options` table — a generic
// type/value lookup list (e.g. filter facet options for Phase 2 Discovery:
// condition types, slaughter methods, etc.).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("wdh_options"))
      return;
    await queryInterface.createTable("wdh_options", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      type: { type: Sequelize.STRING(50), allowNull: false },
      value: { type: Sequelize.STRING(255), allowNull: false },
      sort_order: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addConstraint("wdh_options", {
      fields: ["type", "value"],
      type: "unique",
      name: "uq_type_value",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("wdh_options");
  },
};
