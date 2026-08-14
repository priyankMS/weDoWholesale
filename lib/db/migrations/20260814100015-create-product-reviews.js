"use strict";

// Mirrors the client's existing `product_reviews` table.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("product_reviews"))
      return;
    await queryInterface.createTable("product_reviews", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      comment: { type: Sequelize.TEXT, allowNull: false },
      image: { type: Sequelize.STRING(255), allowNull: true },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("product_reviews", ["product_id"]);
    await queryInterface.addIndex("product_reviews", ["user_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("product_reviews");
  },
};
