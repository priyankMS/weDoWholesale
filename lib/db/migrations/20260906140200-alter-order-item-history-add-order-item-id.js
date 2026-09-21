"use strict";


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("order_item_history");
    if (table.order_item_id) return;
    await queryInterface.addColumn("order_item_history", "order_item_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("order_item_history", "order_item_id");
  },
};
