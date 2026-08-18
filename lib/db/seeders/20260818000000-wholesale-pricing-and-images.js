"use strict";



const rows = require("./data/wholesale-pricing.json");

const ITEM_ALIASES = {
  "Chicken|Chicken Leg & Thigh": "Chicken Legs & Thighs",
  "Goat|Goat HeartKidney": "Goat Heart, Kidney",
  "Goat|Goat RibChopLoin": "Goat Ribs, Chops, Loin",
  "Fish|Fish Marntd Fish": "Marinated Fish",
  "Lamb|Lamb HeartKidney": "Lamb Heart, Kidney",
  "Beef|Beef Eye of Rnd": "Beef Eye of Round",
  "Beef|Beef Spleen": "Beef Splean",
  "Lamb|Lamb Shldr Chops": "Lamb Shoulder Chops",
  "Lamb|Lamb RibChopLoin": "Lamb Ribs, Chops, Loin",
};

function parsePrice(value) {
  const n = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const products = await queryInterface.sequelize.query(
      "SELECT id, category, item FROM wdh_products",
      { type: Sequelize.QueryTypes.SELECT },
    );
    const variants = await queryInterface.sequelize.query(
      "SELECT id, product_id, condition_type, bone_type, skin_type FROM wdh_variants",
      { type: Sequelize.QueryTypes.SELECT },
    );

    const productByKey = new Map();
    for (const p of products) productByKey.set(`${p.category}||${p.item}`.toLowerCase(), p);

    const variantsByProduct = new Map();
    for (const v of variants) {
      if (!variantsByProduct.has(v.product_id)) variantsByProduct.set(v.product_id, []);
      variantsByProduct.get(v.product_id).push(v);
    }

    // variant_id -> best {price, image} across every spreadsheet row that
    // resolves to it (a product can have multiple supplier rows per
    // condition — the lowest price wins, same policy as bestVariantPrice()
    // in lib/db/queries/catalogue.ts).
    const updates = new Map();

    for (const row of rows) {
      const aliasedItem = ITEM_ALIASES[`${row.subcat}|${row.item}`] || row.item;
      const product = productByKey.get(`${row.subcat}||${aliasedItem}`.toLowerCase());
      if (!product) continue;

      const candidates = variantsByProduct.get(product.id) || [];
      const match = candidates.find(
        (v) =>
          (v.condition_type || "") === row.condition &&
          (!v.bone_type || v.bone_type === row.bone) &&
          (!v.skin_type || v.skin_type === row.skin),
      );
      if (!match) continue;

      const price = parsePrice(row.wholesale);
      if (price == null) continue;

      const existing = updates.get(match.id);
      if (!existing || price < existing.price) {
        updates.set(match.id, { price, image: row.image || existing?.image || null });
      }
    }

    for (const [variantId, { price, image }] of updates) {
      await queryInterface.sequelize.query(
        `UPDATE wdh_variants
         SET base_price = COALESCE(base_price, :price),
             image1 = COALESCE(NULLIF(image1, ''), :image),
             thumbnail = COALESCE(NULLIF(thumbnail, ''), :image)
         WHERE id = :variantId`,
        { replacements: { price, image, variantId } },
      );
    }

    console.log(
      `[wholesale-pricing seed] matched ${updates.size} of ${rows.length} spreadsheet rows to real variants (${products.length} products / ${variants.length} variants in catalogue).`,
    );
  },

  async down() {
    // A data backfill isn't meaningfully reversible without a pre-seed
    // snapshot of base_price/image1/thumbnail — intentionally a no-op.
  },
};
