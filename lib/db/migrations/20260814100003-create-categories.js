"use strict";

// Mirrors the client's existing `categories` table (product category tree
// used across both retail and wholesale product listings).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("categories")) return;
    await queryInterface.createTable("categories", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: true },
      slug: { type: Sequelize.STRING(100), allowNull: true, unique: true },
      image: { type: Sequelize.STRING(255), allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("categories");
  },
};
