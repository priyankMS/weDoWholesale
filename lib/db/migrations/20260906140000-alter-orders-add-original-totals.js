"use strict";

// Order revision system: once an admin adds/edits/substitutes an item on an
// existing order, `total_amount`/`gst_amount`/`final_amount` become the
// live/revised numbers — these three columns snapshot the pre-revision
// totals (set once, the first time an order is revised) so "Original" and
// "Refund/Due" can still be shown on the invoice and account pages.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("orders");
    if (!table.original_total_amount) {
      await queryInterface.addColumn("orders", "original_total_amount", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      });
    }
    if (!table.original_gst_amount) {
      await queryInterface.addColumn("orders", "original_gst_amount", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      });
    }
    if (!table.original_final_amount) {
      await queryInterface.addColumn("orders", "original_final_amount", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("orders", "original_total_amount");
    await queryInterface.removeColumn("orders", "original_gst_amount");
    await queryInterface.removeColumn("orders", "original_final_amount");
  },
};
