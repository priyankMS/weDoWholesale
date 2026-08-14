"use strict";

// Mirrors the client's existing `products` table — an early, mostly-empty
// product table superseded by `products_new` and then `wdh_products`.
// Still referenced by `product_attributes`, `product_variants`, and
// `product_reviews` foreign keys, so it's kept.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("products")) return;
    await queryInterface.createTable("products", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      title: { type: Sequelize.TEXT, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      shortDescription: { type: Sequelize.TEXT, allowNull: true },
      thumbnail: { type: Sequelize.STRING(255), allowNull: true },
      images: { type: Sequelize.TEXT("long"), allowNull: true },
      basePrice: { type: Sequelize.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
      discountPrice: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      isFeatured: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
      isActive: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: true },
      stockStatus: {
        type: Sequelize.ENUM("in_stock", "out_of_stock", "preorder"),
        allowNull: true,
        defaultValue: "in_stock",
      },
      sku: { type: Sequelize.STRING(100), allowNull: true },
      metaTitle: { type: Sequelize.STRING(255), allowNull: true },
      metaDescription: { type: Sequelize.TEXT, allowNull: true },
      tags: { type: Sequelize.STRING(255), allowNull: true },
      rating: { type: Sequelize.FLOAT, allowNull: true, defaultValue: 0 },
      totalReviews: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("products");
  },
};
