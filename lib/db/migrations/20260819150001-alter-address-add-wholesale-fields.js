"use strict";

// Phase 4's "Delivery addresses" screen needs a nickname/label per saved
// address (e.g. "Main kitchen", "Catering unit") and a default flag —
// neither existed on the retail-site `address` table this project inherited
// (see Address.ts). Additive only.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("address", "label", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn("address", "is_default", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("address", "is_default");
    await queryInterface.removeColumn("address", "label");
  },
};
