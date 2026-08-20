"use strict";

// Key/value store for admin-configurable platform settings (Master Admin
// → Settings page): default markup %, free delivery threshold, wholesale
// minimum order, GST rate. A single flat table rather than one column per
// setting on some other table — settings.value is always cast at read
// time by the code that consumes it (defaultMarkupPercent etc. are all
// numeric today).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("platform_settings", {
      key: { type: Sequelize.STRING(100), primaryKey: true },
      value: { type: Sequelize.STRING(255), allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: "updated_at" },
    });

    await queryInterface.bulkInsert("platform_settings", [
      { key: "default_markup_percent", value: "15", updated_at: new Date() },
      { key: "free_delivery_threshold", value: "150", updated_at: new Date() },
      { key: "wholesale_min_order_kg", value: "100", updated_at: new Date() },
      { key: "gst_rate_percent", value: "5", updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("platform_settings");
  },
};
