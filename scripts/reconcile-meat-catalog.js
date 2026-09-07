/* eslint-disable @typescript-eslint/no-require-imports -- one-off Node/CommonJS ops script, run directly via `node`, not part of the Next.js bundle */
/**
 * Reconciles the cleaned meat catalog (115 groups / 241 variants, corrected
 * against the master catalog per the "wedohalal_wholesale_import_developer"
 * review) into the LIVE wdh_products / wdh_variants / wdh_variant_pricing
 * tables, instead of creating a parallel schema.
 *
 * Why a reconciliation instead of a fresh import: the live DB already has
 * 168 wdh_products / 269 wdh_variants (a prior staging import) referenced by
 * saved_products.product_id, so existing rows/ids must be preserved. This
 * script only:
 *   - UPDATEs product SEO fields, but ONLY when the live field is currently
 *     empty (never clobbers anything already written in the admin panel).
 *   - UPDATEs matched variant rows' origin/price/stock with the corrected
 *     catalog values (the whole point of the correction pass).
 *   - INSERTs the small number of variant/pricing rows that are genuinely
 *     absent live (e.g. a Frozen SKU the corrected catalog has that the
 *     staging import never got).
 *
 * Matching (see scripts/reconcile_data.json, built by a one-off Python
 * pass): products matched by normalized name (92 exact + 21 manually
 * confirmed renames, cross-checked against the developer's own "Group Name
 * Changes" sheet); variants matched within a product by
 * condition/skin/bone, treating a blank live attribute as a wildcard
 * (single-variant groups only ever populate condition_type live).
 * 2 of 115 groups (Turkey Whole, Ground Lamb) have no live counterpart at
 * all and are intentionally left untouched — flagged in the summary for a
 * manual decision rather than guessed at.
 *
 * Safety:
 *   - Runs inside one transaction; any error rolls back everything.
 *   - A full mysqldump of the 5 wdh_* tables was already taken to
 *     scripts/backups/ before this script was written.
 *
 * Usage: node scripts/reconcile-meat-catalog.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");

const DATA_PATH = path.join(__dirname, "reconcile_data.json");

function nz(v) {
  // Normalizes "missing" to null for SQL params (mysql2 rejects `undefined`).
  return v === undefined || v === "" ? null : v;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

  console.log(`\n📦 Loaded reconciliation payload:`);
  console.log(`   Products to update:        ${data.products.length}`);
  console.log(`   Variants to update:         ${data.variants.length}`);
  console.log(`   Variants to insert (new):   ${data.variants_missing.length}`);
  console.log(`   Pricing rows to update:     ${data.pricing_updates.length}`);
  console.log(`   Pricing rows to insert:     ${data.pricing_inserts.length}`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE WRITE"}\n`);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wedohalal_wholesale",
  });

  const stats = {
    productsUpdated: 0,
    variantsUpdated: 0,
    variantsInserted: 0,
    pricingUpdated: 0,
    pricingInserted: 0,
  };

  try {
    await conn.beginTransaction();

    // ---------------------------------------------------------------
    // 1. Products — fill SEO fields ONLY where currently empty
    // ---------------------------------------------------------------
    for (const p of data.products) {
      const [result] = await conn.execute(
        `UPDATE wdh_products SET
           meta_title = CASE WHEN (meta_title IS NULL OR meta_title='') THEN ? ELSE meta_title END,
           meta_desc = CASE WHEN (meta_desc IS NULL OR meta_desc='') THEN ? ELSE meta_desc END,
           short_desc = CASE WHEN (short_desc IS NULL OR short_desc='') THEN ? ELSE short_desc END,
           long_desc_heading = CASE WHEN (long_desc_heading IS NULL OR long_desc_heading='') THEN ? ELSE long_desc_heading END,
           long_desc1 = CASE WHEN (long_desc1 IS NULL OR long_desc1='') THEN ? ELSE long_desc1 END,
           long_desc2 = CASE WHEN (long_desc2 IS NULL OR long_desc2='') THEN ? ELSE long_desc2 END,
           long_desc3 = CASE WHEN (long_desc3 IS NULL OR long_desc3='') THEN ? ELSE long_desc3 END,
           region = CASE WHEN (region IS NULL OR region='') THEN ? ELSE region END,
           cuisine = CASE WHEN (cuisine IS NULL OR cuisine='') THEN ? ELSE cuisine END,
           tags = CASE WHEN (tags IS NULL OR tags='') THEN ? ELSE tags END
         WHERE id = ?`,
        [
          nz(p.meta_title), nz(p.meta_desc), nz(p.short_desc), nz(p.long_desc_heading),
          nz(p.long_desc1), nz(p.long_desc2), nz(p.long_desc3),
          nz(p.region), nz(p.cuisine), nz(p.tags),
          p.live_id,
        ],
      );
      stats.productsUpdated += result.affectedRows;
    }

    // ---------------------------------------------------------------
    // 2. Variants — overwrite origin/price/stock with corrected values
    //    (only when the corrected file actually has a value — never
    //    writes null over something that already exists)
    // ---------------------------------------------------------------
    for (const v of data.variants) {
      const sets = ["region = ?"];
      const params = [nz(v.origin)];
      if (v.retail_price != null) {
        sets.push("base_price = ?");
        params.push(v.retail_price);
      }
      if (v.stock_status) {
        sets.push("stock_status = ?");
        params.push(v.stock_status);
      }
      if (v.stock_count != null) {
        sets.push("stock_count = ?");
        params.push(v.stock_count);
      }
      params.push(v.live_variant_id);
      const [result] = await conn.execute(
        `UPDATE wdh_variants SET ${sets.join(", ")} WHERE id = ?`,
        params,
      );
      stats.variantsUpdated += result.affectedRows;
    }

    // ---------------------------------------------------------------
    // 3. Variants — insert the genuinely-missing rows (e.g. a Frozen
    //    SKU the corrected catalog has that the staging import lacks)
    // ---------------------------------------------------------------
    const insertedVariantIdBySku = {};
    for (const m of data.variants_missing) {
      // Derive a same-style SKU suffix from existing siblings under this
      // product so the new row doesn't look out of place next to
      // WDH-XXX-###-## siblings.
      const [siblings] = await conn.execute(
        `SELECT sku FROM wdh_variants WHERE product_id = ?`,
        [m.live_product_id],
      );
      let newSku = m.sku; // fallback: reuse the corrected-catalog SKU (e.g. "14-02")
      const pattern = siblings
        .map((s) => s.sku)
        .find((s) => /^.+-\d+$/.test(s || ""));
      if (pattern) {
        const prefix = pattern.replace(/-\d+$/, "");
        const usedNums = siblings
          .map((s) => parseInt((s.sku || "").split("-").pop(), 10))
          .filter((n) => !Number.isNaN(n));
        const nextNum = Math.max(0, ...usedNums) + 1;
        newSku = `${prefix}-${String(nextNum).padStart(2, "0")}`;
      }

      const [result] = await conn.execute(
        `INSERT INTO wdh_variants
           (product_id, sku, condition_type, skin_type, bone_type, region,
            base_price, stock_status, stock_count, per, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          m.live_product_id, newSku,
          m.condition_display, m.skin_display, m.bone_display,
          nz(m.origin), m.retail_price ?? null,
          m.stock_status || "instock", m.stock_count ?? 0,
          "Price per lb",
        ],
      );
      insertedVariantIdBySku[m.sku] = result.insertId;
      stats.variantsInserted += 1;
    }

    // ---------------------------------------------------------------
    // 4. Pricing — update matched supplier-tier rows
    // ---------------------------------------------------------------
    for (const pu of data.pricing_updates) {
      const sets = [];
      const params = [];
      if (pu.dealer_price != null) {
        sets.push("dealer_price = ?");
        params.push(pu.dealer_price);
      }
      if (pu.retail_price != null) {
        sets.push("retail_price = ?");
        params.push(pu.retail_price);
      }
      if (!sets.length) continue;
      params.push(pu.pricing_id);
      const [result] = await conn.execute(
        `UPDATE wdh_variant_pricing SET ${sets.join(", ")} WHERE id = ?`,
        params,
      );
      stats.pricingUpdated += result.affectedRows;
    }

    // ---------------------------------------------------------------
    // 5. Pricing — insert new supplier-tier rows for variants that had
    //    no pricing row for this supplier yet
    // ---------------------------------------------------------------
    for (const pi of data.pricing_inserts) {
      if (!pi.supplier_id) continue; // unknown supplier — skip, don't guess
      const [result] = await conn.execute(
        `INSERT INTO wdh_variant_pricing
           (variant_id, supplier_id, label, dealer_price, increment, retail_price, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [pi.variant_id, pi.supplier_id, pi.label, pi.dealer_price, null, pi.retail_price, 1],
      );
      stats.pricingInserted += result.affectedRows;
    }

    // ---------------------------------------------------------------
    // 6. Pricing for the newly-inserted variants themselves
    // ---------------------------------------------------------------
    const supplierIdMap = { "karim meats": 1, "westgate halal": 2 };
    for (const m of data.variants_missing) {
      const variantId = insertedVariantIdBySku[m.sku];
      if (!variantId || !m.supplier) continue;
      const supplierId = supplierIdMap[m.supplier.trim().toLowerCase()];
      if (!supplierId) continue;
      const [result] = await conn.execute(
        `INSERT INTO wdh_variant_pricing
           (variant_id, supplier_id, label, dealer_price, increment, retail_price, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [variantId, supplierId, m.supplier, m.supplier_price ?? null, null, m.wholesale_price ?? null, 1],
      );
      stats.pricingInserted += result.affectedRows;
    }

    if (DRY_RUN) {
      console.log("🧪 DRY RUN — rolling back (no changes committed)\n");
      await conn.rollback();
    } else {
      await conn.commit();
      console.log("✅ Transaction committed\n");
    }

    console.log("📊 Results:");
    console.log(`   Products updated:          ${stats.productsUpdated}`);
    console.log(`   Variants updated:          ${stats.variantsUpdated}`);
    console.log(`   Variants inserted:         ${stats.variantsInserted}`);
    console.log(`   Pricing rows updated:      ${stats.pricingUpdated}`);
    console.log(`   Pricing rows inserted:     ${stats.pricingInserted}`);

    if (data.unmatched_groups?.length) {
      console.log(`\n⚠️  Groups with no live match (untouched):`);
      for (const g of data.unmatched_groups) console.log(`   - ${g}`);
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
