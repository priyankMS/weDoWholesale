"use strict";


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("admin_password_resets", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      adminId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "admin_users", key: "id" },
        onDelete: "CASCADE",
      },
      tokenHash: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      usedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("admin_password_resets", ["adminId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("admin_password_resets");
  },
};
