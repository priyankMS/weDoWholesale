/* eslint-disable @typescript-eslint/no-require-imports -- one-off Node/CommonJS ops script, run directly via `node`, not part of the Next.js bundle */
/**
 * Fixes the 58 collided variant rows from reconcile-meat-catalog.js: each
 * one had 2-5 distinct clean-catalog SKUs (differing by Fat level and/or
 * Supplier and/or product form — e.g. "Whole" vs "Cut Up" chicken) that all
 * mapped onto a single live wdh_variants row, so the original UPDATEs
 * silently overwrote each other (last write won). reconcile-meat-catalog.js
 * already mitigated the immediate risk by nulling those 58 rows' base_price;
 * this script does the real fix now that migration
 * 20260904120000-alter-wdh-variants-add-fat-level has added a fat_level
 * column:
 *
 *   - The FIRST clean SKU in each group updates the EXISTING live variant
 *     row (fills fat_level, cut_value [product form, e.g. "Whole Chicken
 *     With Skin" — reuses the previously-unused cut_value column], origin,
 *     base_price, stock) and resets its pricing row to that SKU's own price
 *     (undoing the earlier collision there too).
 *   - Each REMAINING clean SKU becomes a brand new wdh_variants row cloning
 *     the shared condition/skin/bone, with its own fat_level/cut_value/
 *     price/stock and its own wdh_variant_pricing row.
 *
 * Input: scripts/fat_split_plan.json (built by a one-off Python pass —
 * see the reconciliation note in memory for how it was derived and cross
 * checked against the master catalog's Short Product Name column via
 * Legacy SKU).
 *
 * Usage: node scripts/split-fat-level-variants.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const PLAN_PATH = path.join(__dirname, "fat_split_plan.json");

const SUPPLIER_ID_MAP = { "karim meats": 1, "westgate halal": 2 };

function nz(v) {
  return v === undefined || v === "" ? null : v;
}

async function main() {
  const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf-8"));
  console.log(`\n📦 Loaded fat-split plan: ${plan.length} collided variant groups, ${plan.reduce((n, p) => n + p.entries.length, 0)} clean SKUs total`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE WRITE"}\n`);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wedohalal_wholesale",
  });

  const stats = { variantsUpdated: 0, variantsInserted: 0, pricingUpdated: 0, pricingInserted: 0, skippedNoPricingRow: 0, skippedUnknownSupplier: 0 };

  try {
    await conn.beginTransaction();

    for (const group of plan) {
      const [[existing]] = await conn.query(
        `SELECT product_id, sku, condition_type, skin_type, bone_type, per FROM wdh_variants WHERE id = ?`,
        [group.live_variant_id],
      );
      if (!existing) {
        console.warn(`⚠️  live_variant_id ${group.live_variant_id} no longer exists — skipping group`);
        continue;
      }

      // Existing sibling SKUs under this product, to derive fresh SKU
      // suffixes for the new rows (same style as reconcile-meat-catalog.js).
      const [siblings] = await conn.query(`SELECT sku FROM wdh_variants WHERE product_id = ?`, [existing.product_id]);
      const skuPattern = siblings.map((s) => s.sku).find((s) => /^.+-\d+$/.test(s || ""));
      const prefix = skuPattern ? skuPattern.replace(/-\d+$/, "") : existing.sku.replace(/-\d+$/, "");
      let usedNums = siblings.map((s) => parseInt((s.sku || "").split("-").pop(), 10)).filter((n) => !Number.isNaN(n));

      for (let i = 0; i < group.entries.length; i++) {
        const e = group.entries[i];
        const isFirst = i === 0;
        let variantId;

        if (isFirst) {
          await conn.execute(
            `UPDATE wdh_variants SET fat_level = ?, cut_value = ?, region = ?, base_price = ?, stock_status = ?, stock_count = ? WHERE id = ?`,
            [nz(e.fat), nz(e.short_product_name), nz(e.origin), e.retail_price ?? null, e.stock_status || "instock", e.stock_count ?? 0, group.live_variant_id],
          );
          variantId = group.live_variant_id;
          stats.variantsUpdated += 1;
        } else {
          const nextNum = Math.max(0, ...usedNums) + 1;
          usedNums.push(nextNum);
          const newSku = `${prefix}-${String(nextNum).padStart(2, "0")}`;
          const [result] = await conn.execute(
            `INSERT INTO wdh_variants
               (product_id, sku, condition_type, skin_type, bone_type, fat_level, cut_value, region,
                base_price, stock_status, stock_count, per, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              existing.product_id, newSku,
              existing.condition_type, existing.skin_type, existing.bone_type,
              nz(e.fat), nz(e.short_product_name), nz(e.origin),
              e.retail_price ?? null, e.stock_status || "instock", e.stock_count ?? 0,
              existing.per || "Price per lb",
            ],
          );
          variantId = result.insertId;
          stats.variantsInserted += 1;
        }

        // Pricing: reset/attach this entry's own supplier price to ITS
        // variant row (no more collision — each variant row is now unique).
        if (!e.supplier) continue;
        const supplierId = SUPPLIER_ID_MAP[e.supplier.trim().toLowerCase()];
        if (!supplierId) {
          stats.skippedUnknownSupplier += 1;
          continue;
        }

        if (isFirst) {
          const [[pricingRow]] = await conn.query(
            `SELECT id FROM wdh_variant_pricing WHERE variant_id = ? AND supplier_id = ?`,
            [variantId, supplierId],
          );
          if (pricingRow) {
            await conn.execute(
              `UPDATE wdh_variant_pricing SET dealer_price = ?, retail_price = ? WHERE id = ?`,
              [e.supplier_price ?? null, e.wholesale_price ?? null, pricingRow.id],
            );
            stats.pricingUpdated += 1;
          } else {
            await conn.execute(
              `INSERT INTO wdh_variant_pricing (variant_id, supplier_id, label, dealer_price, increment, retail_price, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [variantId, supplierId, e.supplier, e.supplier_price ?? null, null, e.wholesale_price ?? null, 1],
            );
            stats.pricingInserted += 1;
            stats.skippedNoPricingRow += 1;
          }
        } else {
          await conn.execute(
            `INSERT INTO wdh_variant_pricing (variant_id, supplier_id, label, dealer_price, increment, retail_price, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [variantId, supplierId, e.supplier, e.supplier_price ?? null, null, e.wholesale_price ?? null, 1],
          );
          stats.pricingInserted += 1;
        }
      }
    }

    if (DRY_RUN) {
      console.log("🧪 DRY RUN — rolling back (no changes committed)\n");
      await conn.rollback();
    } else {
      await conn.commit();
      console.log("✅ Transaction committed\n");
    }

    console.log("📊 Results:");
    console.log(`   Variants updated (kept original id):  ${stats.variantsUpdated}`);
    console.log(`   Variants inserted (new rows):          ${stats.variantsInserted}`);
    console.log(`   Pricing rows updated:                  ${stats.pricingUpdated}`);
    console.log(`   Pricing rows inserted:                 ${stats.pricingInserted}`);
    console.log(`   Skipped (unknown supplier):            ${stats.skippedUnknownSupplier}`);
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
