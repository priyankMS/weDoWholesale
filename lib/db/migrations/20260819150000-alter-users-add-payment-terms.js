"use strict";

// Phase 4 (Account Management) — "Payment methods & terms" screen needs a
// real place to read approved Net 15 / Net 30 terms and a credit limit
// from. Nullable/additive only, same pattern as
// 20260814120000-alter-users-add-wholesale-fields.js: most existing
// accounts won't have terms set until an admin approves them (out of scope
// here — the admin panel is being built concurrently in a separate app).

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "payment_terms", {
      type: Sequelize.ENUM("cod", "net15", "net30"),
      allowNull: true,
    });
    await queryInterface.addColumn("users", "credit_limit", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "credit_limit");
    await queryInterface.removeColumn("users", "payment_terms");
  },
};
