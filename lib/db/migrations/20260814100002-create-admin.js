"use strict";

// Mirrors the client's existing `admin` table (retail-site admin panel
// logins — separate from wholesale/retail `users`).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("admin")) return;
    await queryInterface.createTable("admin", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      username: { type: Sequelize.STRING(100), allowNull: false },
      contact: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(100), allowNull: false },
      password: { type: Sequelize.STRING(100), allowNull: false },
      address: { type: Sequelize.TEXT, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("admin");
  },
};
