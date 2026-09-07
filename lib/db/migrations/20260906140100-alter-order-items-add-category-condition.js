"use strict";

// Order revision invoice needs a Category and Condition column per line
// item (matching the supplier's manual revision-receipt template) —
// snapshotted from WdhProduct.category / WdhVariant.conditionType at the
// time an item is added to an order, the same way product_name/sku are
// already snapshotted rather than joined live from the catalogue.
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
