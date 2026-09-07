/* eslint-disable @typescript-eslint/no-require-imports -- one-off Node/CommonJS ops script, run directly via `node`, not part of the Next.js bundle */
/**
 * Populates wdh_variants.cut_type ("Cut Style" — Whole, Cubes, Stew Cut,
 * etc, the wdh_options cut_type enum) across the live catalogue.
 *
 * The cut_type/cut_value columns already exist on wdh_variants (added by
 * migration 20260904120000-alter-wdh-variants-add-fat-level's sibling work)
 * but are empty on every row today — no product currently offers a Cut
 * Style choice. This script gives each product a starting set of Cut Style
 * variants, following the exact same collision-safe pattern as
 * scripts/split-fat-level-variants.js:
 *
 *   - For each existing wdh_variants row with an empty cut_type, the FIRST
 *     applicable Cut Style (see CATEGORY_CUT_STYLES below) is written onto
 *     THAT row (no new row, no price touched) — so today's price/stock
 *     carries forward onto "the first cut" rather than being duplicated.
 *   - Each REMAINING applicable Cut Style becomes a brand new wdh_variants
 *     row, cloning the shared condition/skin/bone/fat_level/region, with
 *     base_price/discount_price left NULL and stock_count 0 — per instruction,
 *     actual per-cut pricing gets filled in later via the admin panel
 *     (Admin > Variants), not guessed here.
 *   - wdh_variant_pricing rows are NOT created for the new variants (no
 *     supplier price to assign yet) — the admin form's Base Price field is
 *     how pricing gets attached once known.
 *
 * IMPORTANT — CATEGORY_CUT_STYLES below is a *starting point*, not verified
 * per-product data: it says "every Beef product gets offered Whole / Cubes
 * / Stew Cut / Strips / Ground", which won't be true for every single SKU
 * (e.g. a beef product that should only ever be "Whole" would get 4 empty
 * variants it doesn't need). Review/edit the mapping for your catalogue
 * before running live — remove rows in the DB afterwards for any product
 * where a generated Cut Style doesn't apply, or narrow CATEGORY_CUT_STYLES
 * up front and re-run with --dry-run to check the plan first.
 *
 * Usage:
 *   node scripts/populate-cut-style.js --dry-run   # print the plan, write nothing
 *   node scripts/populate-cut-style.js             # apply it for real
 */

const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");

// Matches the existing wdh_options "cut_type" enum values (Whole, Stew Cut,
// Chops, Cubes, Strips, Ground, Minced, Fillet, All Muscles) — edit freely,
// this is the part that should reflect YOUR catalogue, not a guess of ours.
const CATEGORY_CUT_STYLES = {
  Beef: ["Whole", "Cubes", "Stew Cut", "Strips", "Ground"],
  Lamb: ["Whole", "Chops", "Cubes", "Stew Cut", "Ground"],
  Goat: ["Whole", "Chops", "Cubes", "Stew Cut", "Ground"],
  Chicken: ["Whole", "All Muscles", "Cubes", "Strips", "Minced"],
  Turkey: ["Whole", "All Muscles", "Cubes"],
  Fish: ["Whole", "Fillet", "Strips"],
};

async function main() {
  console.log(`\n🔪 Cut Style backfill — mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE WRITE"}\n`);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wedohalal_wholesale",
  });

  const stats = { productsTouched: 0, variantsUpdated: 0, variantsInserted: 0, productsSkippedNoMapping: 0 };

  try {
    await conn.beginTransaction();

    const [products] = await conn.query(
      `SELECT id, category FROM wdh_products WHERE category IS NOT NULL`,
    );

    for (const product of products) {
      const styles = CATEGORY_CUT_STYLES[product.category];
      if (!styles || !styles.length) {
        stats.productsSkippedNoMapping += 1;
        continue;
      }

      const [variants] = await conn.query(
        `SELECT id, sku, condition_type, skin_type, bone_type, fat_level, region, per, stock_status
           FROM wdh_variants WHERE product_id = ? AND (cut_type IS NULL OR cut_type = '')`,
        [product.id],
      );
      if (!variants.length) continue;

      let touchedThisProduct = false;

      for (const existing of variants) {
        const [siblings] = await conn.query(`SELECT sku FROM wdh_variants WHERE product_id = ?`, [product.id]);
        const skuPattern = siblings.map((s) => s.sku).find((s) => /^.+-\d+$/.test(s || ""));
        const prefix = skuPattern ? skuPattern.replace(/-\d+$/, "") : (existing.sku || `PROD${product.id}`).replace(/-\d+$/, "");
        let usedNums = siblings.map((s) => parseInt((s.sku || "").split("-").pop(), 10)).filter((n) => !Number.isNaN(n));

        for (let i = 0; i < styles.length; i++) {
          const style = styles[i];
          if (i === 0) {
            await conn.execute(`UPDATE wdh_variants SET cut_type = ? WHERE id = ?`, [style, existing.id]);
            stats.variantsUpdated += 1;
          } else {
            const nextNum = Math.max(0, ...usedNums) + 1;
            usedNums.push(nextNum);
            const newSku = `${prefix}-${String(nextNum).padStart(2, "0")}`;
            await conn.execute(
              `INSERT INTO wdh_variants
                 (product_id, sku, condition_type, skin_type, bone_type, fat_level, cut_type, region,
                  base_price, discount_price, stock_status, stock_count, per, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, 0, ?, NOW(), NOW())`,
              [
                product.id, newSku,
                existing.condition_type, existing.skin_type, existing.bone_type, existing.fat_level,
                style, existing.region,
                existing.stock_status || "outofstock",
                existing.per || "Price per lb",
              ],
            );
            stats.variantsInserted += 1;
          }
          touchedThisProduct = true;
        }
      }

      if (touchedThisProduct) stats.productsTouched += 1;
    }

    if (DRY_RUN) {
      console.log("🧪 DRY RUN — rolling back (no changes committed)\n");
      await conn.rollback();
    } else {
      await conn.commit();
      console.log("✅ Transaction committed\n");
    }

    console.log("📊 Results:");
    console.log(`   Products touched:                 ${stats.productsTouched}`);
    console.log(`   Products skipped (no category mapping): ${stats.productsSkippedNoMapping}`);
    console.log(`   Variants updated (first cut, kept price/id): ${stats.variantsUpdated}`);
    console.log(`   Variants inserted (new cuts, price left NULL for admin panel): ${stats.variantsInserted}`);
  } catch (err) {
    await conn.rollback();
    console.error("\n❌ Error — transaction rolled back, no changes made:");
    console.error(err);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

main();
