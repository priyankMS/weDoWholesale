/* eslint-disable @typescript-eslint/no-require-imports -- one-off Node/CommonJS ops script, run directly via `node`, not part of the Next.js bundle */
/**
 * Imports wedohalal_wholesale_variants_import_v2.csv (703 rows) — the
 * cut-style expansion of the existing 115-group / 241-variant catalog.
 * Each old single SKU (e.g. "1-01") is expanded here into several
 * "-CS#" per-cut-style SKUs (e.g. "1-01-CS1".."1-01-CS6"), driven by the
 * new "Cut Style" column this file adds.
 *
 * Verified against the live DB first (scripts/tmp-verify-v2-variants.js):
 * 0 of these 703 SKUs exist yet, all 115 product groups already exist and
 * are correctly named. So this is a pure INSERT job — old SKUs are left
 * untouched (not replaced/deleted), since they may be referenced by
 * existing orders and deciding to retire them is a separate decision.
 *
 * Mapping:
 *   - product_id: resolved from each SKU's leading "<groupNum>-" prefix
 *     against an EXISTING variant carrying that same prefix (proven
 *     zero-ambiguity across all 115 groups in the verification pass) —
 *     NOT from wdh_products.id/hb_id, which aren't populated.
 *   - cut_value: the new "Cut Style" column (e.g. "Whole (1 piece)",
 *     "Cut Up (6 pcs)") — reusing this previously-established column the
 *     same way scripts/split-fat-level-variants.js already does (a
 *     free-text product-form descriptor), cut_type left unset to match.
 *   - long_title: "Variant Label" (the full descriptive string).
 *   - base_price: "Wholesale Price ($) - DRAFT" — same caveat as the last
 *     import: this is a straight per-kg unit conversion of retail, not a
 *     real wholesale rate. 462 of 703 rows leave it blank (only the first
 *     cut-style row per group carries pricing in the source file) — left
 *     null here rather than invented/copied from a sibling row.
 *   - wdh_variant_pricing: one row per variant that has a non-blank
 *     Supplier Price and/or Retail Price, supplier matched by
 *     case-insensitive substring ("Karim Meats" -> "Karim", "Westgate
 *     Halal" -> "Westgate" — both already exist in wdh_suppliers).
 *   - Sub 1/2/3 (SKU) related-product columns: not imported — no table
 *     models that relationship yet.
 *
 * SKU-existence guarded (skips rows whose SKU already exists), so
 * re-running this script is always safe.
 *
 * Usage: node scripts/import-v2-cut-style-variants.js [--dry-run]
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const CSV_PATH = "/Users/priyankshiroya/Downloads/wedohalal_wholesale_variants_import_v2.csv";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const header = rows[0];
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, idx) => [h, r[idx] ?? ""])));
}

function nz(v) {
  const t = typeof v === "string" ? v.trim() : v;
  return t === undefined || t === null || t === "" ? null : t;
}
function num(v) {
  const n = nz(v);
  if (n === null) return null;
  const f = Number(n);
  return Number.isFinite(f) ? f : null;
}
function perLabel(per) {
  const p = nz(per);
  if (!p) return null;
  const unit = p.replace(/^per\s+/i, "").trim();
  return unit ? `Price per ${unit}` : null;
}

async function main() {
  const csvRows = parseCsv(fs.readFileSync(CSV_PATH, "utf-8"));
  console.log(`Loaded ${csvRows.length} CSV rows. Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE WRITE"}\n`);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wedohalal_wholesale",
  });

  const [existingVariants] = await conn.execute(`SELECT id, product_id, sku FROM wdh_variants`);
  const [suppliers] = await conn.execute(`SELECT id, name FROM wdh_suppliers`);

  const existingSkus = new Set(existingVariants.map((v) => String(v.sku).trim()));
  const productIdByGroupNum = new Map();
  for (const v of existingVariants) {
    const m = /^(\d+)-/.exec(v.sku || "");
    if (m) productIdByGroupNum.set(m[1], v.product_id);
  }

  function matchSupplier(csvName) {
    const needle = csvName.trim().toLowerCase();
    return suppliers.find((s) => needle.includes(s.name.trim().toLowerCase())) || null;
  }

  const stats = { inserted: 0, skippedExisting: 0, pricingInserted: 0, noProductMatch: [], supplierUnmatched: [] };

  try {
    await conn.beginTransaction();

    for (const row of csvRows) {
      const sku = nz(row["SKU"]);
      if (!sku) continue;

      if (existingSkus.has(sku)) {
        stats.skippedExisting += 1;
        continue;
      }

      const groupNum = /^(\d+)-/.exec(sku)?.[1];
      const productId = groupNum ? productIdByGroupNum.get(groupNum) : null;
      if (!productId) {
        stats.noProductMatch.push(sku);
        continue;
      }

      const variantValues = {
        product_id: productId,
        sku,
        legacy_sku: nz(row["Legacy SKU"]),
        condition_type: nz(row["Condition"]),
        cut_value: nz(row["Cut Style"]),
        skin_type: nz(row["Skin"]),
        bone_type: nz(row["Bone"]),
        fat_level: nz(row["Fat"]),
        region: nz(row["Origin"]),
        long_title: nz(row["Variant Label"]),
        cut_options: nz(row["Available Work / Cut Options"]),
        min_order_qty: num(row["Min Order Qty"]),
        min_order_unit: nz(row["Min Order Unit"]),
        weight_lbs: num(row["Weight (lbs)"]),
        weight_kg: num(row["Weight (kg)"]),
        base_price: num(row["Wholesale Price ($) - DRAFT"]),
        stock_status: nz(row["Stock Status"]) || "instock",
        stock_count: num(row["Stock Count"]) ?? 0,
        per: perLabel(row["Wholesale Price per"]),
      };

      let variantId;
      if (DRY_RUN) {
        variantId = -1; // placeholder, no real insert
      } else {
        const [result] = await conn.execute(
          `INSERT INTO wdh_variants
             (product_id, sku, legacy_sku, condition_type, cut_value, skin_type, bone_type, fat_level, region,
              long_title, cut_options, min_order_qty, min_order_unit, weight_lbs, weight_kg,
              base_price, stock_status, stock_count, per, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            variantValues.product_id, variantValues.sku, variantValues.legacy_sku, variantValues.condition_type,
            variantValues.cut_value, variantValues.skin_type, variantValues.bone_type, variantValues.fat_level,
            variantValues.region, variantValues.long_title, variantValues.cut_options, variantValues.min_order_qty,
            variantValues.min_order_unit, variantValues.weight_lbs, variantValues.weight_kg, variantValues.base_price,
            variantValues.stock_status, variantValues.stock_count, variantValues.per,
          ],
        );
        variantId = result.insertId;
      }
      stats.inserted += 1;

      const supplierPrice = num(row["Supplier Price ($)"]);
      const retailPrice = num(row["WeDoHalal Retail Price ($)"]);
      if (supplierPrice !== null || retailPrice !== null) {
        const supplierRow = matchSupplier(row["Supplier"]);
        if (!supplierRow) stats.supplierUnmatched.push(row["Supplier"]);
        if (!DRY_RUN) {
          await conn.execute(
            `INSERT INTO wdh_variant_pricing (variant_id, supplier_id, label, dealer_price, retail_price, sort_order)
             VALUES (?, ?, ?, ?, ?, 0)`,
            [variantId, supplierRow ? supplierRow.id : null, supplierRow ? supplierRow.name : "Standard", supplierPrice, retailPrice],
          );
        }
        stats.pricingInserted += 1;
      }
    }

    if (DRY_RUN) {
      console.log("DRY RUN — rolling back (no changes committed)\n");
      await conn.rollback();
    } else {
      await conn.commit();
      console.log("Transaction committed\n");
    }
  } catch (err) {
    await conn.rollback();
    console.error("Error — transaction rolled back, no changes made:");
    console.error(err);
    process.exitCode = 1;
    return;
  } finally {
    await conn.end();
  }

  console.log("Results:");
  console.log(`  Variants inserted:            ${stats.inserted}`);
  console.log(`  Pricing rows inserted:        ${stats.pricingInserted}`);
  console.log(`  Skipped (SKU already exists): ${stats.skippedExisting}`);
  console.log(`  No matching product group:    ${stats.noProductMatch.length}`);
  if (stats.noProductMatch.length) console.log(`    -> ${stats.noProductMatch.slice(0, 20).join(", ")}`);
  console.log(`  Supplier name unmatched:      ${stats.supplierUnmatched.length}`);
  if (stats.supplierUnmatched.length) console.log(`    -> ${[...new Set(stats.supplierUnmatched)].join(", ")}`);
}

main();
