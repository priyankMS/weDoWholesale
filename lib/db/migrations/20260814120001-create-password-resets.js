"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("password_resets", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        // Matches the real `users.id` column, which is a signed int(11)
        // (not UNSIGNED) in the client's existing database — a mismatched
        // signedness would make MySQL reject the foreign key.
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
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

    await queryInterface.addIndex("password_resets", ["userId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("password_resets");
  },
};
