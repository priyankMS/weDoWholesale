"use strict";

// Mirrors the client's existing `users` table in its ORIGINAL form (before
// the wholesale-specific columns added by
// 20260814120000-alter-users-add-wholesale-fields.js). Kept separate so a
// completely fresh database can be built up purely through `npm run
// db:migrate` without needing the client's raw SQL dump.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("users")) return;
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_name: { type: Sequelize.STRING(500), allowNull: true },
      email: { type: Sequelize.STRING(500), allowNull: true },
      password: { type: Sequelize.STRING(500), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      create_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
