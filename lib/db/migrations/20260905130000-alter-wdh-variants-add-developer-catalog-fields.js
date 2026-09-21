"use strict";


module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("wdh_variants");

    if (!table.legacy_sku) {
      await queryInterface.addColumn("wdh_variants", "legacy_sku", {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: "",
      });
    }
    if (!table.cut_options) {
      await queryInterface.addColumn("wdh_variants", "cut_options", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!table.min_order_qty) {
      await queryInterface.addColumn("wdh_variants", "min_order_qty", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      });
    }
    if (!table.min_order_unit) {
      await queryInterface.addColumn("wdh_variants", "min_order_unit", {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: "",
      });
    }
    if (!table.weight_lbs) {
      await queryInterface.addColumn("wdh_variants", "weight_lbs", {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
      });
    }
    if (!table.weight_kg) {
      await queryInterface.addColumn("wdh_variants", "weight_kg", {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("wdh_variants", "legacy_sku");
    await queryInterface.removeColumn("wdh_variants", "cut_options");
    await queryInterface.removeColumn("wdh_variants", "min_order_qty");
    await queryInterface.removeColumn("wdh_variants", "min_order_unit");
    await queryInterface.removeColumn("wdh_variants", "weight_lbs");
    await queryInterface.removeColumn("wdh_variants", "weight_kg");
  },
};
