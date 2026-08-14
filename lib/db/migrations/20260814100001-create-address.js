"use strict";

// Mirrors the client's existing `address` table exactly (customer delivery
// addresses on the retail site). Skips creation if it already exists —
// e.g. when the schema was seeded from the client's own DB backup rather
// than built up purely through migrations.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("address")) return;
    await queryInterface.createTable("address", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(50), allowNull: true },
      mobile: { type: Sequelize.STRING(12), allowNull: true },
      email: { type: Sequelize.STRING(100), allowNull: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false },
      address: { type: Sequelize.TEXT, allowNull: true },
      zip_code: { type: Sequelize.TEXT, allowNull: true },
      city: { type: Sequelize.TEXT, allowNull: true },
      country: { type: Sequelize.TEXT, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("address");
  },
};
