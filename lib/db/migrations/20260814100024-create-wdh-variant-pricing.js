"use strict";

// Mirrors the client's existing `wdh_variant_pricing` table — per-supplier
// tiered pricing (dealer cost, increment, retail) for a `wdh_variants` row.
// This is the wholesale tiered-pricing mechanism referenced across the
// Phase 2/3 mockups.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (
      (await queryInterface.showAllTables()).includes("wdh_variant_pricing")
    )
      return;
    await queryInterface.createTable("wdh_variant_pricing", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      variant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "wdh_variants", key: "id" },
        onDelete: "CASCADE",
      },
      supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "wdh_suppliers", key: "id" },
        onDelete: "SET NULL",
      },
      label: { type: Sequelize.STRING(50), allowNull: false, defaultValue: "" },
      dealer_price: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      increment: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      retail_price: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      sort_order: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
    });
    await queryInterface.addIndex("wdh_variant_pricing", ["variant_id"], {
      name: "fk_wvp_variant",
    });
    await queryInterface.addIndex("wdh_variant_pricing", ["supplier_id"], {
      name: "fk_wvp_supplier",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("wdh_variant_pricing");
  },
};
