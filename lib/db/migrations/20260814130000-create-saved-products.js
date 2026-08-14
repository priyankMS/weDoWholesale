"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("saved_products", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        // Signed to match the real `users.id` column (not UNSIGNED) — see
        // 20260814120001-create-password-resets.js for the same note.
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "user_id",
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "product_id",
        references: { model: "wdh_products", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: "created_at" },
    });

    await queryInterface.addIndex("saved_products", ["user_id"]);
    await queryInterface.addConstraint("saved_products", {
      fields: ["user_id", "product_id"],
      type: "unique",
      name: "saved_products_user_id_product_id_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("saved_products");
  },
};
