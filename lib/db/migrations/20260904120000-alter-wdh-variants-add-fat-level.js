"use strict";

// Additive fix: the master catalog defines some product groups' variants by
// Condition + Fat + Supplier (e.g. Chicken Whole: skin/bone stay constant,
// only Fat and Supplier vary) but `wdh_variants` had no column for Fat
// level, so those SKUs had nowhere to live distinctly — see the
// reconciliation note in scripts/reconcile_data.json / memory for the
// concrete collision this caused (2026-09-04 catalog import).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("wdh_variants");
    if (table.fat_level) return;
    await queryInterface.addColumn("wdh_variants", "fat_level", {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: "",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("wdh_variants", "fat_level");
  },
};
