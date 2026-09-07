"use strict";

// Adds the columns needed to hold the developer's corrected wholesale
// catalog import (wedohalal_wholesale_import_developer.xlsx,
// wholesale_variants_import tab — 241 SKUs / 115 groups, reviewed field by
// field against the master catalog) directly on wdh_variants, mirroring
// migration 20260904120000-alter-wdh-variants-add-fat-level's pattern
// (idempotent — checks describeTable before adding each column, so it's
// safe to re-run).
//
//   - legacy_sku: the old numeric row id (Legacy SKU column) — kept so old
//     orders/URLs/supplier lists can still be mapped to the new SKUs.
//   - cut_options: the FULL, UNALTERED "Available Work / Cut Options" text
//     for the group (e.g. "Whole / do not cut, Cut to small pieces, ...")
//     — this is a per-group note of what the buyer can ask to have done to
//     the product, not a priced per-SKU choice, so it's stored as one text
//     field rather than decomposed into the wdh_options cut_type enum.
//   - min_order_qty / min_order_unit: the wholesale MOQ (e.g. 20 kg).
//   - weight_lbs / weight_kg: the master catalog's per-unit weight.
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
