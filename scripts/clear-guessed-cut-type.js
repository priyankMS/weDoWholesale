/* eslint-disable @typescript-eslint/no-require-imports -- one-off Node/CommonJS ops script, run directly via `node`, not part of the Next.js bundle */
/**
 * Clears the fabricated `wdh_variants.cut_type` values written by the
 * earlier scripts/populate-cut-style.js run.
 *
 * That script guessed a "Cut Style" per product category (e.g. every Beef
 * product got one of Whole/Cubes/Stew Cut/Strips/Ground assigned by a
 * hand-written CATEGORY_CUT_STYLES table) — those names were never in any
 * real catalog file. The developer's actual catalog only has a free-text
 * "Available Work / Cut Options" note per SKU (now stored in the separate
 * `cut_options` column via scripts/import-developer-catalog.js), not a
 * short categorical "Cut Style" pick.
 *
 * This script does NOT invent a replacement value — it just nulls out
 * cut_type everywhere so the site stops showing invented names as if they
 * were real choices. `cut_type` and its "Cut Style" selector stay in the
 * schema/UI (lib/variantDimensions.ts, AdminVariantForm.tsx) so real values
 * can be entered by hand in the admin panel later if the business wants a
 * true categorical Cut Style filter; until then it will simply not appear
 * as a selectable dimension (activeVariantDimensions only shows a
 * dimension when 2+ variants of a product have a value for it).
 *
 * Usage: node scripts/clear-guessed-cut-type.js [--dry-run]
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
    const [before] = await conn.execute(
      `SELECT cut_type, COUNT(*) c FROM wdh_variants WHERE cut_type IS NOT NULL GROUP BY cut_type ORDER BY c DESC`,
    );
    console.log("\n📋 Current cut_type values (about to be cleared):");
    for (const row of before) console.log(`   ${row.cut_type}: ${row.c} variant(s)`);
    if (!before.length) {
      console.log("   (none — cut_type is already empty, nothing to do)\n");
      await conn.end();
      return;
    }

    await conn.beginTransaction();
    const [result] = await conn.execute(
      `UPDATE wdh_variants SET cut_type = NULL WHERE cut_type IS NOT NULL`,
    );

    if (DRY_RUN) {
      console.log(`\n🧪 DRY RUN — would clear cut_type on ${result.affectedRows} variant(s), rolling back\n`);
      await conn.rollback();
    } else {
      await conn.commit();
      console.log(`\n✅ Cleared cut_type on ${result.affectedRows} variant(s) — committed\n`);
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
