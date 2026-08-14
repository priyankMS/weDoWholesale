"use strict";

// Mirrors the client's existing `order_item_history` table — an audit log
// of line-item add/update/remove actions, storing a before/after JSON-ish
// snapshot. This is the mechanism behind the "ordered vs. picked-up
// weight" revision tracking seen in the wholesale portal mockups.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (
      (await queryInterface.showAllTables()).includes("order_item_history")
    )
      return;
    await queryInterface.createTable("order_item_history", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: { type: Sequelize.INTEGER, allowNull: false },
      action: {
        type: Sequelize.ENUM("added", "updated", "removed"),
        allowNull: false,
      },
      product_name: { type: Sequelize.STRING(255), allowNull: false },
      sku: { type: Sequelize.STRING(100), allowNull: true, defaultValue: "" },
      snapshot_before: { type: Sequelize.TEXT("long"), allowNull: true },
      snapshot_after: { type: Sequelize.TEXT("long"), allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("order_item_history", ["order_id"], {
      name: "idx_oih_order_id",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("order_item_history");
  },
};
