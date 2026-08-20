"use strict";

// Phase 5 (Communication) — per-user read receipts for Announcement rows.
// Absence of a row means unread; written in bulk by "Mark all read".

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("announcement_reads", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "user_id",
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      announcementId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        field: "announcement_id",
        references: { model: "announcements", key: "id" },
        onDelete: "CASCADE",
      },
      readAt: { type: Sequelize.DATE, allowNull: false, field: "read_at" },
    });

    await queryInterface.addConstraint("announcement_reads", {
      fields: ["user_id", "announcement_id"],
      type: "unique",
      name: "announcement_reads_user_id_announcement_id_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("announcement_reads");
  },
};
