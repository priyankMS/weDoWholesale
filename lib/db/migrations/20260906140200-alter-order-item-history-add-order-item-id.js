"use strict";

// order_item_history previously only matched history rows to items by
// orderId + productName, which breaks the moment an item is substituted to
// a different product. New revision-engine code paths (addOrderItem /
// updateOrderItem in lib/db/queries/adminOrders.ts) key history rows off
// order_item_id instead. Deliberately no FK constraint — the item this
// points at is never hard-deleted (see the "revise to 0" note in
// updateOrderItem), but keeping this column loose avoids any risk of a
// constraint blocking a future cleanup. Existing rows stay null; the old
// productName-matching lookups are untouched and keep working for them.
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
