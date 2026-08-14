"use strict";

// Mirrors the client's existing `wdh_products` table — the current,
// normalized product schema for the wholesale portal (product → variants
// → per-supplier variant pricing). This is the authoritative product
// table for Phase 2 (Discovery and Browsing) going forward.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("wdh_products"))
      return;
    await queryInterface.createTable("wdh_products", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      category: { type: Sequelize.STRING(100), allowNull: true, defaultValue: "" },
      hb_id: { type: Sequelize.STRING(100), allowNull: true, defaultValue: "" },
      sku: { type: Sequelize.STRING(100), allowNull: true, defaultValue: "" },
      type: { type: Sequelize.STRING(100), allowNull: true, defaultValue: "" },
      item: { type: Sequelize.STRING(255), allowNull: false },
      has_variants: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      short_desc_heading: { type: Sequelize.TEXT, allowNull: true },
      short_desc: { type: Sequelize.TEXT, allowNull: true },
      long_desc_heading: { type: Sequelize.TEXT, allowNull: true },
      long_desc1: { type: Sequelize.TEXT, allowNull: true },
      long_desc2: { type: Sequelize.TEXT, allowNull: true },
      long_desc3: { type: Sequelize.TEXT, allowNull: true },
      meta_title: { type: Sequelize.TEXT, allowNull: true },
      meta_desc: { type: Sequelize.TEXT, allowNull: true },
      tags: { type: Sequelize.TEXT, allowNull: true },
      region: { type: Sequelize.TEXT, allowNull: true },
      cuisine: { type: Sequelize.TEXT, allowNull: true },
      thumbnail: { type: Sequelize.TEXT, allowNull: true },
      thumbnail_alt: { type: Sequelize.TEXT, allowNull: true },
      image1: { type: Sequelize.TEXT, allowNull: true },
      image1_alt: { type: Sequelize.TEXT, allowNull: true },
      image2: { type: Sequelize.TEXT, allowNull: true },
      image2_alt: { type: Sequelize.TEXT, allowNull: true },
      image3: { type: Sequelize.TEXT, allowNull: true },
      image3_alt: { type: Sequelize.TEXT, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("wdh_products");
  },
};
