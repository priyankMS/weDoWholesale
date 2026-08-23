"use strict";

// The imported staging data left `wdh_products.sku` / `wdh_variants.sku`
// holding raw row IDs (e.g. "92") instead of real SKU codes, and every
// sibling variant of a product ended up sharing that same value — so SKUs
// weren't actually unique per sellable variant. This backfills a proper
// WDH-<CAT>-<seq> scheme (products) and WDH-<CAT>-<seq>-<variant index>
// (variants), matching the client's admin mockup ("WDH-LAM-014" style).

const CATEGORY_CODE = {
  Beef: "BEE",
  Chicken: "CHI",
  Lamb: "LAM",
  Goat: "GOA",
  Fish: "FIS",
  Drinks: "DRI",
  Groceries: "GRO",
  Snacks: "SNA",
  Desserts: "DES",
};

function codeFor(category) {
  return CATEGORY_CODE[category] ?? "GEN";
}

function pad(n, width) {
  return String(n).padStart(width, "0");
}

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;

    await sequelize.transaction(async (transaction) => {
      const products = await sequelize.query(
        "SELECT id, category FROM wdh_products ORDER BY category ASC, id ASC",
        { type: sequelize.QueryTypes.SELECT, transaction },
      );

      const perCategoryCount = new Map();
      const productSkuById = new Map();

      for (const product of products) {
        const code = codeFor(product.category);
        const seq = (perCategoryCount.get(code) ?? 0) + 1;
        perCategoryCount.set(code, seq);
        const sku = `WDH-${code}-${pad(seq, 3)}`;
        productSkuById.set(product.id, sku);

        await sequelize.query("UPDATE wdh_products SET sku = :sku WHERE id = :id", {
          replacements: { sku, id: product.id },
          transaction,
        });
      }

      const variants = await sequelize.query(
        "SELECT id, product_id FROM wdh_variants ORDER BY product_id ASC, id ASC",
        { type: sequelize.QueryTypes.SELECT, transaction },
      );

      const perProductCount = new Map();

      for (const variant of variants) {
        const productSku = productSkuById.get(variant.product_id) ?? `WDH-GEN-${pad(variant.product_id, 3)}`;
        const idx = (perProductCount.get(variant.product_id) ?? 0) + 1;
        perProductCount.set(variant.product_id, idx);
        const sku = `${productSku}-${pad(idx, 2)}`;

        await sequelize.query("UPDATE wdh_variants SET sku = :sku WHERE id = :id", {
          replacements: { sku, id: variant.id },
          transaction,
        });
      }
    });
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize;
    await sequelize.query("UPDATE wdh_products SET sku = NULL");
    await sequelize.query("UPDATE wdh_variants SET sku = NULL");
  },
};
