"use strict";

// New, bcrypt-only admin login table for the Master Admin panel — separate
// from the legacy `admin` table (retail-site admin logins, plain/legacy
// password hash, no session-compatible fields).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("admin_users", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      passwordHash: { type: Sequelize.STRING(255), allowNull: false, field: "password_hash" },
      tokenVersion: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: "token_version",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: "created_at" },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: "updated_at" },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("admin_users");
  },
};
