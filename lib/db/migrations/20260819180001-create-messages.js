"use strict";

// Phase 5 (Communication) — individual chat bubbles within a message_thread.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("messages", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      threadId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        field: "thread_id",
        references: { model: "message_threads", key: "id" },
        onDelete: "CASCADE",
      },
      senderType: {
        type: Sequelize.ENUM("customer", "staff", "system"),
        allowNull: false,
        field: "sender_type",
      },
      senderName: { type: Sequelize.STRING(120), allowNull: true, field: "sender_name" },
      body: { type: Sequelize.TEXT, allowNull: false },
      readAt: { type: Sequelize.DATE, allowNull: true, field: "read_at" },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: "created_at" },
    });

    await queryInterface.addIndex("messages", ["thread_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("messages");
  },
};
