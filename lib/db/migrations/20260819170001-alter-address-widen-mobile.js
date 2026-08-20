"use strict";

// The inherited retail `address.mobile` column is VARCHAR(12) — too short
// for a formatted phone number like "(780) 722-1234" (15 chars), which is
// exactly what Phase 4's "Delivery addresses" form collects and every
// existing checkout delivery-phone field already asks for (see
// components/portal/CheckoutClient.tsx's placeholder). Widening rather than
// leaving new address saves to intermittently fail on real phone numbers.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("address", "mobile", {
      type: Sequelize.STRING(40),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("address", "mobile", {
      type: Sequelize.STRING(12),
      allowNull: true,
    });
  },
};
