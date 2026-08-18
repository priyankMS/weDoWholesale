"use strict";

// Phase 3 (Cart and Checkout) additions to the shared `orders`/`order_items`
// tables. Additive only — never touches the existing retail columns.
//
// - orders.delivery_date: the customer's requested delivery/pickup date.
//   `time_slot` (pre-existing) already covers the AM/PM window text.
// - orders.gst_amount: Alberta wholesale orders are GST-only (no PST) —
//   stored as its own line rather than folded into shipping_fee/
//   discount_amount so it prints correctly on an invoice later.
// - orders.payment_option: the wholesale-specific choice (cod / e_transfer
//   / invoice / net_terms) — kept separate from the existing
//   payment_method ENUM("COD","Online") rather than widening that enum,
//   since payment_method already has retail meaning; the route maps
//   payment_option to the closest payment_method value for backward
//   compatibility with any retail-side reporting that reads it.
// - order_items.variant_id: wholesale line items are against a specific
//   wdh_variants row (a cut/condition/pack of a wdh_products item), which
//   product_id alone doesn't capture.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const ordersTable = await queryInterface.describeTable("orders");
    if (!ordersTable.delivery_date) {
      await queryInterface.addColumn("orders", "delivery_date", {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });
    }
    if (!ordersTable.gst_amount) {
      await queryInterface.addColumn("orders", "gst_amount", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      });
    }
    if (!ordersTable.payment_option) {
      await queryInterface.addColumn("orders", "payment_option", {
        type: Sequelize.STRING(30),
        allowNull: true,
      });
    }

    const orderItemsTable = await queryInterface.describeTable("order_items");
    if (!orderItemsTable.variant_id) {
      await queryInterface.addColumn("order_items", "variant_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
      await queryInterface.addIndex("order_items", ["variant_id"]);
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("order_items", "variant_id");
    await queryInterface.removeColumn("orders", "payment_option");
    await queryInterface.removeColumn("orders", "gst_amount");
    await queryInterface.removeColumn("orders", "delivery_date");
  },
};
