"use strict";

// Phase 5 (Communication) — Screen 29 (Inbox). No existing table covers
// customer <> WeDoHalal team conversations.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("message_threads", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      // Signed to match the real `users.id` column (not UNSIGNED) — same
      // note as saved_products/password_resets.
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "user_id",
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      topic: {
        type: Sequelize.ENUM(
          "general",
          "order_issue",
          "invoice",
          "product_availability",
          "delivery_scheduling",
          "account_terms",
          "welcome",
        ),
        allowNull: false,
        defaultValue: "general",
      },
      subject: { type: Sequelize.STRING(255), allowNull: false },
      orderNumber: { type: Sequelize.STRING(100), allowNull: true, field: "order_number" },
      avatarKind: {
        type: Sequelize.ENUM("staff", "system"),
        allowNull: false,
        defaultValue: "staff",
        field: "avatar_kind",
      },
      icon: { type: Sequelize.STRING(8), allowNull: true },
      tagLabel: { type: Sequelize.STRING(60), allowNull: false, field: "tag_label" },
      tagStyle: {
        type: Sequelize.ENUM("order", "support", "system"),
        allowNull: false,
        defaultValue: "support",
        field: "tag_style",
      },
      lastMessageAt: { type: Sequelize.DATE, allowNull: false, field: "last_message_at" },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: "created_at" },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: "updated_at" },
    });

    await queryInterface.addIndex("message_threads", ["user_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("message_threads");
  },
};
