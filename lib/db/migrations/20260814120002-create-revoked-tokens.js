"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("revoked_tokens", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      jti: { type: Sequelize.STRING(36), allowNull: false, unique: true },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("revoked_tokens", ["expiresAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("revoked_tokens");
  },
};
