"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("order_items");
    if (!table.category) {
      await queryInterface.addColumn("order_items", "category", {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }
    if (!table.condition_type) {
      await queryInterface.addColumn("order_items", "condition_type", {
        type: Sequelize.STRING(50),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("order_items", "category");
    await queryInterface.removeColumn("order_items", "condition_type");
  },
};
