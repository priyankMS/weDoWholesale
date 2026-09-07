/* eslint-disable @typescript-eslint/no-require-imports -- one-off Node/CommonJS ops script, run directly via `node`, not part of the Next.js bundle */
/**
 * Imports the developer's corrected wholesale catalog
 * (wedohalal_wholesale_import_developer.xlsx, "wholesale_variants_import"
 * tab — 241 SKUs / 115 groups, reviewed field by field against the master
 * catalog, see that workbook's "Read Me" / "Fixes and Changes" /
 * "Verification" tabs) into the LIVE wdh_products / wdh_variants tables.
 *
 * This supersedes any earlier guessed values (invented Cut Style names,
 * placeholder Origin, etc) with the developer's real, reconciled data:
 *
 *   - wdh_products.item is renamed to the file's Group Name (exactly as
 *     given — these are the names the developer's Group Name Changes tab
 *     says to keep).
 *   - wdh_variants.sku / legacy_sku / condition_type / skin_type /
 *     bone_type / fat_level / region (Country of Origin) / cut_options
 *     (the full, unaltered "Available Work / Cut Options" text — NOT
 *     shortened or renamed) / min_order_qty / min_order_unit / weight_lbs
 *     / weight_kg / stock_status / stock_count / base_price / per are all
 *     set from the file.
 *
 * Matching (see scripts/developer_catalog_import_plan.json, built by
 * joining this file's SKUs against scripts/reconcile_data.json's
 * already-established SKU/id mapping — that mapping came from matching
 * Group Name against the live catalog, 92 exact + 21 manually confirmed
 * renames):
 *   - 227 SKUs matched an existing live wdh_variants row -> UPDATE.
 *   - 11 SKUs have no live row yet under a product that DOES exist live
 *     -> INSERT a new wdh_variants row.
 *   - 3 SKUs (Turkey Whole, Ground Lamb — 2 whole groups with no live
 *     product at all) have nothing to attach to and are intentionally
 *     left untouched; printed at the end for a manual decision rather
 *     than guessed at.
 *
 * IMPORTANT re: pricing — "Wholesale Price ($) - DRAFT" in the source file
 * is a straight per-kg unit conversion of the retail price, NOT a real
 * wholesale rate (the workbook's own Read Me says so explicitly). This
 * script writes it into base_price as a starting point so nothing is left
 * blank, but treat it as a draft: replace it with real wholesale pricing
 * in the admin panel before relying on it.
 *
 * Requires migration 20260905130000-alter-wdh-variants-add-developer-
 * catalog-fields to have been run first (adds legacy_sku, cut_options,
 * min_order_qty, min_order_unit, weight_lbs, weight_kg to wdh_variants).
 *
 * Usage: node scripts/import-developer-catalog.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const PLAN_PATH = path.join(__dirname, "developer_catalog_import_plan.json");

function nz(v) {
  return v === undefined || v === null || v === "" ? null : v;
}

function perLabel(per) {
  // xlsx "Wholesale Price per" is "per kg" / "per pk" — the rest of the
  // codebase's `per` column instead reads "Price per kg" (see
  // split-fat-level-variants.js's `existing.per || "Price per lb"`
  // fallback), so match that convention rather than introducing a second
  // format.
  if (!per) return null;
  const unit = per.replace(/^per\s+/i, "").trim();
  return unit ? `Price per ${unit}` : null;
}

async function main() {
  const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf-8"));
  console.log(`\n📦 Loaded developer catalog import plan:`);
  console.log(`   Product renames:            ${plan.productRenames.length}`);
  console.log(`   Variants to update:         ${plan.updates.length}`);
  console.log(`   Variants to insert (new):   ${plan.inserts.length}`);
  console.log(`   Skipped (no live product):  ${plan.skipped.length}`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE WRITE"}\n`);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wedohalal_wholesale",
  });

  const stats = { productsRenamed: 0, variantsUpdated: 0, variantsInserted: 0 };

  try {
    await conn.beginTransaction();

    // 1. Product Group Name -> wdh_products.item
    for (const p of plan.productRenames) {
      const [result] = await conn.execute(`UPDATE wdh_products SET item = ? WHERE id = ?`, [
        p.groupName,
        p.liveProductId,
      ]);
      stats.productsRenamed += result.affectedRows;
    }

    // 2. Matched variants -> UPDATE with the file's real values
    for (const v of plan.updates) {
      await conn.execute(
        `UPDATE wdh_variants SET
           sku = ?, legacy_sku = ?, condition_type = ?, skin_type = ?, bone_type = ?, fat_level = ?,
           region = ?, cut_options = ?, min_order_qty = ?, min_order_unit = ?,
           weight_lbs = ?, weight_kg = ?, stock_status = ?, stock_count = ?,
           base_price = ?, per = ?
         WHERE id = ?`,
        [
          v.sku, nz(v.legacySku), nz(v.conditionType), nz(v.skinType), nz(v.boneType), nz(v.fatLevel),
          nz(v.origin), nz(v.cutOptions), v.minOrderQty ?? null, nz(v.minOrderUnit),
          v.weightLbs ?? null, v.weightKg ?? null, v.stockStatus || "instock", v.stockCount ?? 0,
          v.basePrice ?? null, perLabel(v.per),
          v.liveVariantId,
        ],
      );
      stats.variantsUpdated += 1;
    }

    // 3. Variants with no live row yet -> INSERT under the known live product
    //    Guarded by SKU existence so re-running this script (it was run
    //    twice before this guard existed) can never create duplicate rows.
    let skippedExisting = 0;
    for (const v of plan.inserts) {
      const [existing] = await conn.execute(`SELECT id FROM wdh_variants WHERE sku = ? LIMIT 1`, [v.sku]);
      if (existing.length) {
        skippedExisting += 1;
        continue;
      }
      await conn.execute(
        `INSERT INTO wdh_variants
           (product_id, sku, legacy_sku, condition_type, skin_type, bone_type, fat_level, region,
            cut_options, min_order_qty, min_order_unit, weight_lbs, weight_kg,
            base_price, stock_status, stock_count, per, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          v.liveProductId, v.sku, nz(v.legacySku), nz(v.conditionType), nz(v.skinType), nz(v.boneType), nz(v.fatLevel),
          nz(v.origin), nz(v.cutOptions), v.minOrderQty ?? null, nz(v.minOrderUnit),
          v.weightLbs ?? null, v.weightKg ?? null,
          v.basePrice ?? null, v.stockStatus || "instock", v.stockCount ?? 0, perLabel(v.per),
        ],
      );
      stats.variantsInserted += 1;
    }

    if (DRY_RUN) {
      console.log("🧪 DRY RUN — rolling back (no changes committed)\n");
      await conn.rollback();
    } else {
      await conn.commit();
      console.log("✅ Transaction committed\n");
    }

    console.log("📊 Results:");
    console.log(`   Products renamed:   ${stats.productsRenamed}`);
    console.log(`   Variants updated:   ${stats.variantsUpdated}`);
    console.log(`   Variants inserted:  ${stats.variantsInserted}`);
    if (skippedExisting) {
      console.log(`   Inserts skipped (SKU already exists — safe re-run): ${skippedExisting}`);
    }

    if (plan.skipped.length) {
      console.log(`\n⚠️  Skipped — no live product to attach to (create manually if needed):`);
      for (const s of plan.skipped) console.log(`   - ${s.sku} (Group ${s.groupId}: ${s.groupName})`);
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
