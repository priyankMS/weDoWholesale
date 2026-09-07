/* eslint-disable @typescript-eslint/no-require-imports -- one-off Node/CommonJS ops script, run directly via `node`, not part of the Next.js bundle */
/**
 * Cleans up leftover duplicate wdh_variant_pricing rows on the 58 "kept"
 * variant ids from split-fat-level-variants.js. Root cause: the very first
 * reconcile-meat-catalog.js run (before the fat_level fix) processed every
 * colliding clean SKU against the SAME live variant id, and for the pricing
 * table specifically, a few of those became duplicate INSERTs (two rows for
 * the same variant+supplier) rather than one UPDATE. split-fat-level-*
 * already moved the correct value onto its own new variant row; this only
 * removes the stale duplicate left behind on the original row.
 *
 * SAFETY: matching is scoped to the SAME product (via fat_level + cut_value,
 * which split-fat-level-variants.js set uniquely per new row) — NOT by price
 * alone. An earlier version of this script matched purely on
 * (supplier, dealer_price, retail_price) and, in a dry run, flagged rows on
 * completely unrelated products (different variant ids, different product
 * groups) that simply happened to share a common price point — coincidence,
 * not a duplicate. That version was never run live; this rewrite requires
 * the match to be the actual sibling row created for this exact stray entry.
 *
 * Usage: node scripts/cleanup-stray-pricing.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const SUPPLIER_ID_MAP = { "karim meats": 1, "westgate halal": 2 };

async function main() {
  const strayList = JSON.parse(fs.readFileSync("/tmp/stray_pricing.json", "utf-8"));

  console.log(`\n📦 Checking ${strayList.length} candidate stray pricing rows`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE WRITE"}\n`);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wedohalal_wholesale",
  });

  let deleted = 0;
  let notFound = 0;

  try {
    await conn.beginTransaction();

    for (const s of strayList) {
      const supplierId = SUPPLIER_ID_MAP[s.supplier.trim().toLowerCase()];
      if (!supplierId) continue;

      // Find the ACTUAL sibling variant split-fat-level-variants.js created
      // for this exact stray entry — scoped to the same product, matched by
      // the (fat_level, cut_value) pair that script set uniquely per row.
      // This is the safety fix: a price-only match (the previous version of
      // this script) can coincidentally match a totally unrelated product.
      //
      // `id != original_variant_id` guards a second, subtler case found in
      // dry-run: 3 of the 58 groups have two source rows with genuinely
      // identical (fat, cut_value) — e.g. two literal "Boneless Lamb Leg /
      // BBQ" / Medium entries in the source catalog — so this query can
      // otherwise match the ORIGINAL row against its own later stray entry
      // and "clean up" the only copy of that price. Excluding it forces the
      // match onto the actual other inserted row.
      const [[sibling]] = await conn.query(
        `SELECT id FROM wdh_variants WHERE product_id = ? AND fat_level = ? AND cut_value = ? AND id != ?`,
        [s.product_id, s.fat_level || "", s.cut_value || "", s.original_variant_id],
      );
      if (!sibling) {
        console.log(`   ⚠️  no sibling row found for product ${s.product_id} / ${s.cut_value} — leaving original row alone`);
        continue;
      }

      const [[siblingPricing]] = await conn.query(
        `SELECT id FROM wdh_variant_pricing WHERE variant_id = ? AND supplier_id = ? AND dealer_price = ? AND retail_price = ?`,
        [sibling.id, supplierId, s.dealer_price, s.retail_price],
      );
      if (!siblingPricing) {
        console.log(`   ⚠️  sibling variant ${sibling.id} exists but its pricing row doesn't match — leaving original row alone`);
        continue;
      }

      const [rows] = await conn.query(
        `SELECT id FROM wdh_variant_pricing WHERE variant_id = ? AND supplier_id = ? AND dealer_price = ? AND retail_price = ?`,
        [s.original_variant_id, supplierId, s.dealer_price, s.retail_price],
      );
      if (!rows.length) {
        notFound += 1;
        continue;
      }

      for (const r of rows) {
        console.log(`   🗑  delete pricing.id=${r.id} (stale, on original variant ${s.original_variant_id}, ${s.supplier}, $${s.dealer_price}/$${s.retail_price}) — correct copy already on sibling variant ${sibling.id} (pricing.id=${siblingPricing.id})`);
        await conn.execute(`DELETE FROM wdh_variant_pricing WHERE id = ?`, [r.id]);
        deleted += 1;
      }
    }

    if (DRY_RUN) {
      console.log("\n🧪 DRY RUN — rolling back (no changes committed)");
      await conn.rollback();
    } else {
      await conn.commit();
      console.log("\n✅ Transaction committed");
    }
    console.log(`\n📊 Deleted: ${deleted}, not found (already clean): ${notFound}`);
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error — rolled back:", err);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

main();
