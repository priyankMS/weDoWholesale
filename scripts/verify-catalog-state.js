/* eslint-disable @typescript-eslint/no-require-imports -- one-off Node/CommonJS ops script, run directly via `node`, not part of the Next.js bundle */
/**
 * Read-only health check for wdh_variants after the developer catalog
 * import + cleanup scripts. Run this and paste the output back — it's the
 * ground truth for whether the DB is actually in the state we want,
 * instead of guessing from screenshots.
 *
 * Checks:
 *   1. Duplicate SKUs (should be 0 after dedupe-inserted-variants.js)
 *   2. Leftover fabricated cut_type values (should be 0 after
 *      clear-guessed-cut-type.js)
 *   3. How many variants are missing a price (base_price IS NULL) — these
 *      are the ones that will show "Contact for pricing" / blank-looking
 *      "Choose option" buttons on the site until priced in the admin panel
 *   4. How many variants have Country of Origin (region) set
 *   5. How many variants have the real cut_options text set
 *   6. How many variants have fat_level set, and how many PRODUCTS have 2+
 *      distinct fat_level values among their own variants (only those show
 *      a Fat selector on the site — this is expected, not a bug)
 *
 * Usage: node scripts/verify-catalog-state.js
 */

const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wedohalal_wholesale",
  });

  try {
    const [total] = await conn.execute(`SELECT COUNT(*) c FROM wdh_variants`);
    console.log(`\n📦 Total variants: ${total[0].c}\n`);

    const [dupSkus] = await conn.execute(
      `SELECT sku, COUNT(*) c FROM wdh_variants WHERE sku IS NOT NULL AND sku <> '' GROUP BY sku HAVING c > 1`,
    );
    console.log(
      dupSkus.length
        ? `❌ Duplicate SKUs: ${dupSkus.length} (run scripts/dedupe-inserted-variants.js)`
        : `✅ No duplicate SKUs`,
    );

    const [leftoverCutType] = await conn.execute(
      `SELECT COUNT(*) c FROM wdh_variants WHERE cut_type IS NOT NULL AND cut_type <> ''`,
    );
    console.log(
      leftoverCutType[0].c
        ? `❌ ${leftoverCutType[0].c} variant(s) still have a cut_type value (run scripts/clear-guessed-cut-type.js)`
        : `✅ cut_type is clear (no fabricated Cut Style values)`,
    );

    const [noPrice] = await conn.execute(
      `SELECT COUNT(*) c FROM wdh_variants WHERE base_price IS NULL`,
    );
    console.log(
      `ℹ️  ${noPrice[0].c} / ${total[0].c} variants have no base_price set — these show "Contact for pricing" on the site until priced in the admin panel`,
    );

    const [withOrigin] = await conn.execute(
      `SELECT COUNT(*) c FROM wdh_variants WHERE region IS NOT NULL AND region <> ''`,
    );
    console.log(`ℹ️  ${withOrigin[0].c} / ${total[0].c} variants have Country of Origin (region) set`);

    const [withCutOptions] = await conn.execute(
      `SELECT COUNT(*) c FROM wdh_variants WHERE cut_options IS NOT NULL AND cut_options <> ''`,
    );
    console.log(`ℹ️  ${withCutOptions[0].c} / ${total[0].c} variants have real Cut Options text set`);

    const [withFat] = await conn.execute(
      `SELECT COUNT(*) c FROM wdh_variants WHERE fat_level IS NOT NULL AND fat_level <> ''`,
    );
    console.log(`ℹ️  ${withFat[0].c} / ${total[0].c} variants have a Fat Level set`);

    const [fatVaryingGroups] = await conn.execute(`
      SELECT COUNT(*) c FROM (
        SELECT product_id
        FROM wdh_variants
        WHERE fat_level IS NOT NULL AND fat_level <> ''
        GROUP BY product_id
        HAVING COUNT(DISTINCT fat_level) > 1
      ) t
    `);
    console.log(
      `ℹ️  ${fatVaryingGroups[0].c} product(s) have 2+ distinct Fat Levels among their variants — only these show a Fat selector on the site (expected — the rest have one fixed fat level, which isn't a choice)`,
    );

    console.log("\nDone.\n");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exitCode = 1;
});
