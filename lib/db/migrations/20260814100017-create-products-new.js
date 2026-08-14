"use strict";

// Mirrors the client's existing `products_new` table — a wide, flat
// intermediate redesign (per-product tiered dealer/retail pricing s1/s2/s3,
// condition/cut/fat/bone/cuisine attributes, halal-cert one-liner fields).
// This is the table with real populated catalog data from before the
// wdh_* normalization; kept for reference/migration purposes.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes("products_new"))
      return;
    await queryInterface.createTable("products_new", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      group_id: { type: Sequelize.INTEGER, allowNull: true },
      product_name: { type: Sequelize.STRING(255), allowNull: true },
      long_product_name: { type: Sequelize.TEXT, allowNull: true },
      category: { type: Sequelize.STRING(100), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      long_description_heading: { type: Sequelize.TEXT, allowNull: true },
      shortDescription: { type: Sequelize.TEXT, allowNull: true },
      conditionType: { type: Sequelize.STRING(50), allowNull: true },
      cutType: { type: Sequelize.STRING(100), allowNull: true },
      speciality: { type: Sequelize.STRING(100), allowNull: true },
      cuisine: { type: Sequelize.TEXT, allowNull: true },
      fat: { type: Sequelize.STRING(100), allowNull: true },
      skin_type: { type: Sequelize.STRING(100), allowNull: true },
      bone_type: { type: Sequelize.STRING(100), allowNull: true },
      type: { type: Sequelize.STRING(50), allowNull: true },
      work: { type: Sequelize.STRING(50), allowNull: true },
      supplier: { type: Sequelize.STRING(255), allowNull: true },
      weight_lbs: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      gst: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      same_day_shipping: { type: Sequelize.INTEGER, allowNull: true },
      nutritional_profile: { type: Sequelize.TEXT, allowNull: true },
      culinary_uses: { type: Sequelize.TEXT, allowNull: true },
      cultural_and_demographic_appeal: { type: Sequelize.TEXT, allowNull: true },
      thumbnail: { type: Sequelize.TEXT, allowNull: true },
      image1: { type: Sequelize.TEXT, allowNull: true },
      image2: { type: Sequelize.TEXT, allowNull: true },
      image3: { type: Sequelize.TEXT, allowNull: true },
      basePrice: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      discountPrice: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      isFeatured: { type: Sequelize.STRING(50), allowNull: true },
      stock_status: { type: Sequelize.STRING(20), allowNull: true },
      stock_count: { type: Sequelize.INTEGER, allowNull: true },
      sku: { type: Sequelize.STRING(100), allowNull: true },
      per: { type: Sequelize.STRING(20), allowNull: true },
      popularity: { type: Sequelize.STRING(100), allowNull: true },
      upload_status: { type: Sequelize.STRING(20), allowNull: true },
      oli_halal_certified: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "oli stands for one liner image",
      },
      olh_halal_certified: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "olh stands for one liner heading",
      },
      old_halal_certified: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "olh stands for one liner description",
      },
      oli_trusted_supplier: { type: Sequelize.TEXT, allowNull: true },
      olh_trusted_supplier: { type: Sequelize.TEXT, allowNull: true },
      old_trusted_supplier: { type: Sequelize.TEXT, allowNull: true },
      oli_condition: { type: Sequelize.TEXT, allowNull: true },
      olh_condition: { type: Sequelize.TEXT, allowNull: true },
      old_condition: { type: Sequelize.TEXT, allowNull: true },
      oli_care: { type: Sequelize.TEXT, allowNull: true },
      olh_care: { type: Sequelize.TEXT, allowNull: true },
      old_care: { type: Sequelize.TEXT, allowNull: true },
      region: { type: Sequelize.TEXT, allowNull: true },
      metaTitle: { type: Sequelize.TEXT, allowNull: true },
      metaDescription: { type: Sequelize.TEXT, allowNull: true },
      tags: { type: Sequelize.TEXT, allowNull: true },
      s1_dealer: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      s1_increment: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      s1_retail: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      s2_dealer: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      s2_increment: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      s2_retail: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      s3_dealer: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      s3_increment: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      s3_retail: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("products_new");
  },
};
