/* eslint-disable @typescript-eslint/no-require-imports -- one-off verification script */
/**
 * Cross-checks wedohalal_wholesale_variants_import_v2.csv (703 rows, incl.
 * the new "Cut Style" column expanding single groups into per-cut SKUs like
 * 1-01-CS1/CS2/CS3/CS4) against the live wdh_products / wdh_variants /
 * wdh_variant_pricing tables, to answer: has this newer file actually been
 * imported yet, and if partially, what's missing or mismatched.
 *
 * Read-only — no writes. Usage: node scripts/tmp-verify-v2-variants.js
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const CSV_PATH = "/Users/priyankshiroya/Downloads/wedohalal_wholesale_variants_import_v2.csv";
const REPORT_PATH = path.join(__dirname, "tmp-v2-verify-report.txt");

// Minimal RFC4180 CSV parser — handles quoted fields with embedded commas
// and doubled "" escapes, which is all this file uses.
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

function num(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function closeEnough(a, b, eps = 0.01) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return Math.abs(a - b) <= eps;
}

async function main() {
  const csvRows = parseCsv(fs.readFileSync(CSV_PATH, "utf-8"));
  console.log(`Parsed ${csvRows.length} CSV data rows.`);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wedohalal_wholesale",
  });

  const [products] = await conn.execute(`SELECT id, item, sku AS product_sku FROM wdh_products`);
  const [variants] = await conn.execute(`SELECT * FROM wdh_variants`);
  const [pricing] = await conn.execute(`SELECT * FROM wdh_variant_pricing`);
  const [suppliers] = await conn.execute(`SELECT id, name FROM wdh_suppliers`);
  await conn.end();

  const productById = new Map(products.map((p) => [p.id, p]));
  const variantBySku = new Map(variants.map((v) => [String(v.sku).trim(), v]));
  const pricingByVariantId = new Map();
  for (const p of pricing) {
    if (!pricingByVariantId.has(p.variant_id)) pricingByVariantId.set(p.variant_id, []);
    pricingByVariantId.get(p.variant_id).push(p);
  }
  const supplierByName = new Map(suppliers.map((s) => [s.name.trim().toLowerCase(), s]));

  const groupIdsSeen = new Set();
  const missingProducts = [];
  const missingVariants = [];
  const cutValueNeverSet = [];
  const metaMismatches = [];
  const priceMismatches = [];
  const missingPricingRow = [];
  const supplierMissing = new Set();
  let matchedCount = 0;

  for (const row of csvRows) {
    const groupId = row["Group ID"].trim();
    const groupName = row["Group Name"].trim();
    const sku = row["SKU"].trim();
    if (!sku) continue;

    groupIdsSeen.add(`${groupId}::${groupName}`);

    const variant = variantBySku.get(sku);
    if (!variant) {
      missingVariants.push(sku);
      continue;
    }
    matchedCount++;

    const product = productById.get(variant.product_id);
    if (!product) {
      missingProducts.push({ sku, groupId, groupName, product_id: variant.product_id });
    } else if (product.item.trim() !== groupName) {
      metaMismatches.push({ sku, field: "product.item vs Group Name", db: product.item, csv: groupName });
    }

    // Cut Style is a new v2 column -> wdh_variants.cut_value
    const cutStyle = row["Cut Style"].trim();
    if (cutStyle && !variant.cut_value) {
      cutValueNeverSet.push({ sku, cutStyle });
    } else if (cutStyle && variant.cut_value && variant.cut_value.trim() !== cutStyle) {
      metaMismatches.push({ sku, field: "cut_value", db: variant.cut_value, csv: cutStyle });
    }

    // Core metadata fields
    const checks = [
      ["condition_type", row["Condition"]],
      ["skin_type", row["Skin"]],
      ["bone_type", row["Bone"]],
      ["fat_level", row["Fat"]],
      ["region", row["Origin"]],
      ["min_order_unit", row["Min Order Unit"]],
      ["stock_status", row["Stock Status"]],
    ];
    for (const [field, csvVal] of checks) {
      const csvTrim = (csvVal || "").trim();
      const dbVal = (variant[field] || "").trim();
      if (csvTrim && dbVal !== csvTrim) {
        metaMismatches.push({ sku, field, db: dbVal, csv: csvTrim });
      }
    }

    const weightLbs = num(row["Weight (lbs)"]);
    const weightKg = num(row["Weight (kg)"]);
    if (!closeEnough(num(variant.weight_lbs), weightLbs)) {
      metaMismatches.push({ sku, field: "weight_lbs", db: variant.weight_lbs, csv: weightLbs });
    }
    if (!closeEnough(num(variant.weight_kg), weightKg)) {
      metaMismatches.push({ sku, field: "weight_kg", db: variant.weight_kg, csv: weightKg });
    }
    const minOrderQty = num(row["Min Order Qty"]);
    if (!closeEnough(num(variant.min_order_qty), minOrderQty)) {
      metaMismatches.push({ sku, field: "min_order_qty", db: variant.min_order_qty, csv: minOrderQty });
    }
    const stockCount = num(row["Stock Count"]);
    if (!closeEnough(num(variant.stock_count), stockCount, 0.5)) {
      metaMismatches.push({ sku, field: "stock_count", db: variant.stock_count, csv: stockCount });
    }

    const csvCutOptions = (row["Available Work / Cut Options"] || "").trim();
    const dbCutOptions = (variant.cut_options || "").trim();
    if (csvCutOptions && dbCutOptions !== csvCutOptions) {
      metaMismatches.push({ sku, field: "cut_options", db: dbCutOptions.slice(0, 40) + "...", csv: csvCutOptions.slice(0, 40) + "..." });
    }

    // Pricing: wholesale draft price -> base_price; supplier/retail -> wdh_variant_pricing
    const wholesaleDraft = num(row["Wholesale Price ($) - DRAFT"]);
    if (!closeEnough(num(variant.base_price), wholesaleDraft)) {
      priceMismatches.push({ sku, field: "base_price (wholesale draft)", db: variant.base_price, csv: wholesaleDraft });
    }

    const supplierName = row["Supplier"].trim();
    if (supplierName && !supplierByName.has(supplierName.toLowerCase())) {
      supplierMissing.add(supplierName);
    }

    const pricingRows = pricingByVariantId.get(variant.id) || [];
    const supplierPrice = num(row["Supplier Price ($)"]);
    const retailPrice = num(row["WeDoHalal Retail Price ($)"]);
    if (pricingRows.length === 0) {
      if (supplierPrice !== null || retailPrice !== null) {
        missingPricingRow.push({ sku, supplierPrice, retailPrice });
      }
    } else {
      const matchesDealer = pricingRows.some((p) => closeEnough(num(p.dealer_price), supplierPrice));
      const matchesRetail = pricingRows.some((p) => closeEnough(num(p.retail_price), retailPrice));
      if (supplierPrice !== null && !matchesDealer) {
        priceMismatches.push({ sku, field: "wdh_variant_pricing.dealer_price", db: pricingRows.map((p) => p.dealer_price).join("|"), csv: supplierPrice });
      }
      if (retailPrice !== null && !matchesRetail) {
        priceMismatches.push({ sku, field: "wdh_variant_pricing.retail_price", db: pricingRows.map((p) => p.retail_price).join("|"), csv: retailPrice });
      }
    }
  }

  const lines = [];
  const log = (s) => { console.log(s); lines.push(s); };

  log("\n================ V2 IMPORT VERIFICATION REPORT ================\n");
  log(`CSV data rows:                 ${csvRows.length}`);
  log(`Distinct Group ID+Name in CSV: ${groupIdsSeen.size}`);
  log(`Live wdh_products rows:        ${products.length}`);
  log(`Live wdh_variants rows:        ${variants.length}`);
  log(`Live wdh_variant_pricing rows: ${pricing.length}`);
  log(`Live wdh_suppliers rows:       ${suppliers.length}\n`);

  log(`SKUs matched (exist in DB):    ${matchedCount} / ${csvRows.length}`);
  log(`SKUs MISSING from DB:          ${missingVariants.length}`);
  log(`Cut Style never recorded (cut_value NULL): ${cutValueNeverSet.length}`);
  log(`Metadata field mismatches:     ${metaMismatches.length}`);
  log(`Pricing mismatches:            ${priceMismatches.length}`);
  log(`Variants with CSV pricing but no wdh_variant_pricing row: ${missingPricingRow.length}`);
  log(`Suppliers in CSV not in wdh_suppliers: ${[...supplierMissing].join(", ") || "none"}`);
  log(`Product-id-but-not-found anomalies: ${missingProducts.length}`);

  log("\n--- Sample missing SKUs (first 30) ---");
  for (const s of missingVariants.slice(0, 30)) log(`  ${s}`);
  if (missingVariants.length > 30) log(`  ... and ${missingVariants.length - 30} more (full list in report file)`);

  log("\n--- Sample metadata mismatches (first 30) ---");
  for (const m of metaMismatches.slice(0, 30)) log(`  ${m.sku}  [${m.field}]  db="${m.db}"  csv="${m.csv}"`);

  log("\n--- Sample pricing mismatches (first 30) ---");
  for (const m of priceMismatches.slice(0, 30)) log(`  ${m.sku}  [${m.field}]  db=${m.db}  csv=${m.csv}`);

  log("\n--- Variants missing a wdh_variant_pricing row entirely (first 30) ---");
  for (const m of missingPricingRow.slice(0, 30)) log(`  ${m.sku}  supplierPrice=${m.supplierPrice} retailPrice=${m.retailPrice}`);

  // Full detail dumped to file regardless of console truncation
  const full = {
    counts: {
      csvRows: csvRows.length,
      products: products.length,
      variants: variants.length,
      pricingRows: pricing.length,
      matched: matchedCount,
      missingVariants: missingVariants.length,
      cutValueNeverSet: cutValueNeverSet.length,
      metaMismatches: metaMismatches.length,
      priceMismatches: priceMismatches.length,
      missingPricingRow: missingPricingRow.length,
    },
    missingVariants,
    cutValueNeverSet,
    metaMismatches,
    priceMismatches,
    missingPricingRow,
    suppliersMissing: [...supplierMissing],
  };
  fs.writeFileSync(REPORT_PATH.replace(".txt", ".json"), JSON.stringify(full, null, 2));
  fs.writeFileSync(REPORT_PATH, lines.join("\n"));
  console.log(`\nFull report written to:\n  ${REPORT_PATH}\n  ${REPORT_PATH.replace(".txt", ".json")}`);
}

main().catch((err) => {
  console.error("Verification script failed:", err);
  process.exitCode = 1;
});
