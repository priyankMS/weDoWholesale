"use strict";

// Every order item was implicitly treated as "kg" everywhere (admin edit
// table, PDF/Excel invoices, customer account page) even though products
// are priced per kg, lb, or pack (WdhVariant.per / catalogue.ts's unitFor())
// — snapshotted here the same way product_name/sku/category already are,
// so a later catalog change never rewrites what a past order actually said.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("order_items");
    if (!table.unit) {
      await queryInterface.addColumn("order_items", "unit", {
        type: Sequelize.STRING(20),
        allowNull: true,
      });
    }
    // Every existing row predates this column and was always displayed/
    // invoiced as "kg", so backfill explicitly rather than leaving old
    // orders with a blank unit.
    await queryInterface.sequelize.query(
      `UPDATE order_items SET unit = 'kg' WHERE unit IS NULL`,
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("order_items", "unit");
  },
};
