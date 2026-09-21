"use strict";

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
