/* eslint-disable @typescript-eslint/no-require-imports -- one-off Node/CommonJS ops script, run directly via `node`, not part of the Next.js bundle */
/**
 * scripts/import-developer-catalog.js was run twice (once, then again,
 * before its non-idempotent INSERT step — see the fix in that file — was
 * caught). Its UPDATE step is safe to re-run (it just re-sets the same
 * values), but its INSERT step has no "does this SKU already exist" guard,
 * so the 11 previously-missing variants it creates could have been
 * duplicated by the second run.
 *
 * This script finds any SKU in wdh_variants that now has more than one row,
 * keeps the lowest-id row (the original), and deletes the rest. It only
 * ever touches SKUs that are actually duplicated — every other row is left
 * untouched.
 *
 * Usage: node scripts/dedupe-inserted-variants.js [--dry-run]
 */

const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wedohalal_wholesale",
  });

  try {
    const [dupSkus] = await conn.execute(
      `SELECT sku, COUNT(*) c, MIN(id) keep_id FROM wdh_variants GROUP BY sku HAVING c > 1`,
    );

    if (!dupSkus.length) {
      console.log("\n✅ No duplicate SKUs found in wdh_variants — nothing to clean up.\n");
      await conn.end();
      return;
    }

    console.log(`\n📋 Found ${dupSkus.length} duplicated SKU(s):`);
    for (const row of dupSkus) console.log(`   ${row.sku}: ${row.c} rows (keeping id ${row.keep_id})`);

    await conn.beginTransaction();
    let deleted = 0;
    for (const row of dupSkus) {
      const [result] = await conn.execute(
        `DELETE FROM wdh_variants WHERE sku = ? AND id <> ?`,
        [row.sku, row.keep_id],
      );
      deleted += result.affectedRows;
    }

    if (DRY_RUN) {
      console.log(`\n🧪 DRY RUN — would delete ${deleted} duplicate row(s), rolling back\n`);
      await conn.rollback();
    } else {
      await conn.commit();
      console.log(`\n✅ Deleted ${deleted} duplicate row(s) — committed\n`);
    }
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
