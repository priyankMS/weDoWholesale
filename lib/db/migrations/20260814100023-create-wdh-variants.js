"use strict";

// Mirrors the client's existing `wdh_variants` table (a specific
// cut/condition/region combination of a `wdh_products` row).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("wdh_variants")) return;
    await queryInterface.createTable("wdh_variants", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "wdh_products", key: "id" },
        onDelete: "CASCADE",
      },
      sku: { type: Sequelize.STRING(100), allowNull: true, defaultValue: "" },
      type: { type: Sequelize.STRING(100), allowNull: true, defaultValue: "" },
      condition_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: "",
      },
      cut_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: "",
      },
      cut_value: { type: Sequelize.STRING(100), allowNull: true },
      skin_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: "",
      },
      bone_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: "",
      },
      region: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      short_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      long_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      base_price: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      discount_price: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      stock_status: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: "instock",
      },
      stock_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      is_featured: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: "",
      },
      per: { type: Sequelize.STRING(100), allowNull: true, defaultValue: "" },
      popularity: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
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
    await queryInterface.addIndex("wdh_variants", ["product_id"], {
      name: "fk_wdh_variants_product",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("wdh_variants");
  },
};
