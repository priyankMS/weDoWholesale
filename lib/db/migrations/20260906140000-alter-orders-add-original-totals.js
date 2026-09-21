"use strict";


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
