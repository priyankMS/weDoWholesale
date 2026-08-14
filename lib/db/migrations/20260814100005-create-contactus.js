"use strict";

// Mirrors the client's existing `contactus` table (public contact-form
// submissions).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("contactus")) return;
    await queryInterface.createTable("contactus", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: true },
      email: { type: Sequelize.STRING(100), allowNull: true },
      subject: { type: Sequelize.STRING(255), allowNull: true },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      message: { type: Sequelize.TEXT, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("contactus");
  },
};
