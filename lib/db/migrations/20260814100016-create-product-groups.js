"use strict";

// Mirrors the client's existing `product_groups` table (an older grouping
// concept — one "group" bundling multiple product/variant rows, mostly
// superseded by wdh_products for wholesale).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("product_groups"))
      return;
    await queryInterface.createTable("product_groups", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      group_id: { type: Sequelize.INTEGER, allowNull: false, unique: true },
      category: { type: Sequelize.STRING(100), allowNull: true },
      hb_id: { type: Sequelize.STRING(100), allowNull: true, defaultValue: "" },
      sku: { type: Sequelize.STRING(100), allowNull: true },
      type: { type: Sequelize.STRING(100), allowNull: true },
      item: { type: Sequelize.STRING(255), allowNull: true },
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
    await queryInterface.dropTable("product_groups");
  },
};
