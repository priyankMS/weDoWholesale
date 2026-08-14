"use strict";

// The `users` table already exists in the client's real database (imported
// from their retail-site backup — see lib/db/migrations/README, 67 existing
// accounts). This migration is additive only: it never touches the
// pre-existing columns (id, user_name, email, password, is_active,
// create_at), it only adds the columns the wholesale portal needs.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "business_type", {
      type: Sequelize.ENUM("restaurant", "grocery", "mosque", "catering"),
      allowNull: true,
    });
    await queryInterface.addColumn("users", "business_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("users", "city", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn("users", "business_address", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("users", "monthly_volume", {
      type: Sequelize.ENUM(
        "under_50kg",
        "50_100kg",
        "100_200kg",
        "200_500kg",
        "500kg_plus",
      ),
      allowNull: true,
    });
    await queryInterface.addColumn("users", "contact_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("users", "role", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn("users", "phone", {
      type: Sequelize.STRING(40),
      allowNull: true,
    });
    await queryInterface.addColumn("users", "status", {
      type: Sequelize.ENUM("pending_review", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending_review",
    });
    await queryInterface.addColumn("users", "token_version", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn("users", "failed_login_attempts", {
      type: Sequelize.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn("users", "locked_until", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("users", "updated_at", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    // The 67 existing accounts predate the wholesale approval workflow —
    // they're already-functioning retail accounts, not new applications
    // waiting on review, so back-fill them as approved rather than stuck
    // pending. Every *new* wholesale registration explicitly sets
    // status: "pending_review" at creation time regardless of this
    // column's default.
    await queryInterface.sequelize.query(
      "UPDATE `users` SET `status` = 'approved' WHERE `status` = 'pending_review'",
    );

    // Note: the imported data has one duplicate email
    // (oriolinfodeveloper1@gmail.com, ids 3 & 4 — dev/test rows from the
    // agency that built the retail site) so a UNIQUE constraint on `email`
    // isn't added here. The app layer already rejects duplicate emails on
    // registration; add a real unique index once that row is cleaned up.
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "updated_at");
    await queryInterface.removeColumn("users", "locked_until");
    await queryInterface.removeColumn("users", "failed_login_attempts");
    await queryInterface.removeColumn("users", "token_version");
    await queryInterface.removeColumn("users", "status");
    await queryInterface.removeColumn("users", "phone");
    await queryInterface.removeColumn("users", "role");
    await queryInterface.removeColumn("users", "contact_name");
    await queryInterface.removeColumn("users", "monthly_volume");
    await queryInterface.removeColumn("users", "business_address");
    await queryInterface.removeColumn("users", "city");
    await queryInterface.removeColumn("users", "business_name");
    await queryInterface.removeColumn("users", "business_type");
  },
};
