/* eslint-disable @typescript-eslint/no-require-imports -- one-off Node/CommonJS ops script, run directly via `node`, not part of the Next.js bundle */
/**
 * Full rebuild of wdh_products / wdh_variants / wdh_variant_pricing from the
 * two authoritative Dropbox source files (Desktop/Admin/Master admin/
 * Wholesale/), per explicit user instruction: the live catalog accumulated
 * ~1,555 leftover junk variant rows (86% of all 1,805 variants) from an old
 * bulk staging import that earlier reconciliation passes (import-developer-
 * catalog.js etc) only ever partially cleaned up by UPDATE/INSERT onto
 * matched SKUs — they never deleted the unmatched junk sitting alongside it.
 * This script throws all three tables away and rebuilds them from scratch,
 * 1 CSV row = 1 wdh_variant = 1 wdh_variant_pricing row, so there is no
 * leftover data left to be junk.
 *
 * Source files (both scoped to Main Category = Meat only, matching the
 * live catalog's current scope):
 *   - scripts/source_groups_import.csv   (115 rows -> wdh_products)
 *   - scripts/source_variants_import.csv (241 rows -> wdh_variants + wdh_variant_pricing)
 * Verified before writing this script: every variant row's Group ID exists
 * in the groups file, every group has >=1 variant, no duplicate group
 * names/ids, no duplicate SKUs — a clean 1:1 mapping, no fuzzy matching
 * needed.
 *
 * Pricing model (per the user's explicit direction that this is a WHOLESALE
 * platform, not retail): wdh_variant_pricing.dealerPrice = the file's
 * "Supplier Price ($)" (cost), retailPrice = the file's "WeDoHalal Retail
 * Price ($)" (= dealerPrice * (1 + Markup %), already computed in the
 * file) — this retailPrice is what lib/db/queries/catalogue.ts's
 * bestVariantPrice() now reads as the customer-facing price (see the
 * matching change in that file). The file's separate "Wholesale Price
 * ($) - DRAFT" column is NOT used — its own "Price Basis / Note" column
 * says it's a naive per-lb-to-per-kg unit conversion, not a real rate.
 * wdh_variants.basePrice/discountPrice are left NULL on every imported row
 * so that per-supplier pricing (above) is the only source of truth; those
 * two columns remain available as a manual per-variant override later.
 *
 * Cut Style (wdh_variants.cutType): the source file has no structured
 * column for the real product-form differences some groups have (e.g.
 * Chicken Breast's 7 rows are Plain/Cajun/Scallops/Ground/Tawook, not just
 * price variants) — the only signal is the Image URL filename. This script
 * derives a best-effort Cut Style from each row's image filename, with the
 * group name and the row's own Condition/Bone/Skin/Fat words stripped out
 * (so a plain "Chicken Breast" variant image doesn't produce a redundant
 * "Boneless Skinless" style). This is a heuristic, not authoritative data —
 * spot-check a few in the admin panel after running.
 *
 * saved_products has a real FK (ON DELETE CASCADE) to wdh_products, and 3
 * live rows exist (2 real users) referencing products that will be
 * deleted and re-inserted under new ids. This script snapshots those 3
 * rows by product NAME before wiping and re-attaches them to the matching
 * new product id afterward, so those users don't silently lose their
 * saved items. order_items has product_id/variant_id columns but NO
 * foreign key to wdh_products/wdh_variants (verified via SHOW CREATE
 * TABLE) and denormalizes sku/product_name/unit_price/total_price at
 * order time, so historical orders are unaffected either way.
 *
 * Usage: node scripts/rebuild-catalog-from-source.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const GROUPS_CSV = path.join(__dirname, "source_groups_import.csv");
const VARIANTS_CSV = path.join(__dirname, "source_variants_import.csv");

const SUPPLIER_ID_MAP = { "karim meats": 1, "westgate halal": 2 };

// Minimal RFC-4180 CSV parser (handles quoted fields containing commas,
// newlines, and escaped "" quotes) — no CSV library is a project
// dependency, and both source files have multi-line quoted cells
// ("Variant Options (by attribute)" etc).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // skip; \n (or end) closes the row
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const header = rows[0];
  return rows
    .slice(1)
    .filter((r) => r.length > 1 || r[0] !== "")
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));
}

function nz(v) {
  return v === undefined || v === null || v === "" ? null : v;
}
function num(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
// "20.0" -> "20" (Legacy SKU / similar columns came through Excel as floats)
function cleanIntString(v) {
  if (!v) return null;
  const n = Number(v);
  return Number.isNaN(n) ? v : String(Math.trunc(n));
}
// "per lb" -> "Price per lb" — matches the existing convention read by
// lib/db/queries/catalogue.ts's unitFor() (`per.replace(/^Price per /i, "")`).
function perLabel(per) {
  if (!per) return null;
  const unit = per.replace(/^per\s+/i, "").trim();
  return unit ? `Price per ${unit}` : null;
}

const STOPWORDS = new Set(["&", "and", "the", "of"]);

function deriveCutType(imageUrl, groupName, row) {
  if (!imageUrl) return null;
  const filename = imageUrl.split("/").pop() || "";
  const withoutExt = filename.replace(/\.[a-z0-9]+$/i, "");
  const withoutId = withoutExt.replace(/-\d+$/, "");
  const words = withoutId.split(/[-\s]+/).filter(Boolean);

  const exclude = new Set(
    [groupName, row.Condition, row.Bone, row.Skin, row.Fat]
      .filter(Boolean)
      .flatMap((s) => s.toLowerCase().split(/\s+/)),
  );

  const extra = words.filter((w) => w && !STOPWORDS.has(w.toLowerCase()) && !exclude.has(w.toLowerCase()));
  return extra.length ? extra.join(" ") : null;
}

async function main() {
  const groupRows = parseCsv(fs.readFileSync(GROUPS_CSV, "utf-8"));
  const variantRows = parseCsv(fs.readFileSync(VARIANTS_CSV, "utf-8"));

  console.log(`\n📦 Rebuilding catalog from source files`);
  console.log(`   Groups:   ${groupRows.length}`);
  console.log(`   Variants: ${variantRows.length}`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE WRITE"}\n`);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wedohalal_wholesale",
  });

  try {
    // Snapshot the 3 live saved_products rows by product NAME (not id —
    // ids are about to be thrown away) so they can be re-attached to the
    // matching new product afterward.
    const [savedRows] = await conn.execute(
      `SELECT sp.id, sp.user_id, p.item AS product_name
       FROM saved_products sp JOIN wdh_products p ON p.id = sp.product_id`,
    );
    console.log(`💾 Snapshotted ${savedRows.length} saved_products row(s) to re-attach by product name`);

    await conn.beginTransaction();

    const [[{ oldProducts }]] = await conn.query(`SELECT COUNT(*) oldProducts FROM wdh_products`);
    const [[{ oldVariants }]] = await conn.query(`SELECT COUNT(*) oldVariants FROM wdh_variants`);
    const [[{ oldPricing }]] = await conn.query(`SELECT COUNT(*) oldPricing FROM wdh_variant_pricing`);

    await conn.execute(`DELETE FROM wdh_variant_pricing`);
    await conn.execute(`DELETE FROM wdh_variants`);
    await conn.execute(`DELETE FROM wdh_products`);
    // ALTER TABLE causes an implicit commit in MySQL/InnoDB, which would
    // silently defeat --dry-run's rollback (the DELETEs above would commit
    // for real the moment this runs) — so this cosmetic auto-increment
    // reset only happens on an actual live write, never during a dry run.
    if (!DRY_RUN) {
      await conn.execute(`ALTER TABLE wdh_products AUTO_INCREMENT = 1`);
      await conn.execute(`ALTER TABLE wdh_variants AUTO_INCREMENT = 1`);
      await conn.execute(`ALTER TABLE wdh_variant_pricing AUTO_INCREMENT = 1`);
    }

    const productIdByGroupId = new Map();
    const productIdByName = new Map();

    for (const g of groupRows) {
      const [result] = await conn.execute(
        `INSERT INTO wdh_products
           (category, item, has_variants, short_desc, meta_title, meta_desc, thumbnail, created_at, updated_at)
         VALUES (?, ?, 1, ?, ?, ?, ?, NOW(), NOW())`,
        [
          nz(g["Sub-Category"]),
          g["Group Name"],
          nz(g["Short Description"]),
          nz(g["Meta Title - DRAFT"]),
          nz(g["Meta Description - DRAFT"]),
          nz(g["Hero Image"]),
        ],
      );
      productIdByGroupId.set(g["Group ID"], result.insertId);
      productIdByName.set(g["Group Name"], result.insertId);
    }

    let variantsInserted = 0;
    let pricingInserted = 0;
    let unmatchedSuppliers = new Set();
    const cutTypeSamples = [];

    for (const v of variantRows) {
      const productId = productIdByGroupId.get(v["Group ID"]);
      if (!productId) {
        throw new Error(`Variant SKU ${v.SKU} references unknown Group ID ${v["Group ID"]}`);
      }

      const cutType = deriveCutType(v["Image URL"], v["Group Name"], v);
      if (cutType && cutTypeSamples.length < 20) cutTypeSamples.push(`${v.SKU}: ${cutType}`);

      const [variantResult] = await conn.execute(
        `INSERT INTO wdh_variants
           (product_id, sku, legacy_sku, condition_type, cut_type, skin_type, bone_type, fat_level, region,
            cut_options, min_order_qty, min_order_unit, weight_lbs, weight_kg,
            stock_status, stock_count, per, thumbnail, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          productId,
          v.SKU,
          cleanIntString(v["Legacy SKU"]),
          nz(v.Condition),
          cutType,
          nz(v.Skin),
          nz(v.Bone),
          nz(v.Fat),
          nz(v.Origin),
          nz(v["Available Work / Cut Options"]),
          num(v["Min Order Qty"]),
          nz(v["Min Order Unit"]),
          num(v["Weight (lbs)"]),
          num(v["Weight (kg)"]),
          nz(v["Stock Status"]) || "instock",
          num(v["Stock Count"]) ?? 0,
          perLabel(v["Retail Price per"]),
          nz(v["Image URL"]),
        ],
      );
      variantsInserted += 1;
      const variantId = variantResult.insertId;

      const supplierKey = (v.Supplier || "").trim().toLowerCase();
      const supplierId = SUPPLIER_ID_MAP[supplierKey];
      if (!supplierId) {
        unmatchedSuppliers.add(v.Supplier);
        continue;
      }

      await conn.execute(
        `INSERT INTO wdh_variant_pricing (variant_id, supplier_id, label, dealer_price, increment, retail_price, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [variantId, supplierId, v.Supplier, num(v["Supplier Price ($)"]), null, num(v["WeDoHalal Retail Price ($)"]), 1],
      );
      pricingInserted += 1;
    }

    // Re-attach the 3 pre-existing saved_products rows by matching product name.
    let savedReattached = 0;
    let savedDropped = [];
    for (const s of savedRows) {
      const newProductId = productIdByName.get(s.product_name);
      if (!newProductId) {
        savedDropped.push(s.product_name);
        continue;
      }
      await conn.execute(
        `INSERT IGNORE INTO saved_products (user_id, product_id, created_at) VALUES (?, ?, NOW())`,
        [s.user_id, newProductId],
      );
      savedReattached += 1;
    }

    if (DRY_RUN) {
      console.log("\n🧪 DRY RUN — rolling back (no changes committed)");
      await conn.rollback();
    } else {
      await conn.commit();
      console.log("\n✅ Transaction committed");
    }

    console.log(`\n📊 Results:`);
    console.log(`   Products removed:   ${oldProducts}`);
    console.log(`   Variants removed:   ${oldVariants}`);
    console.log(`   Pricing rows removed: ${oldPricing}`);
    console.log(`   Products inserted:  ${groupRows.length}`);
    console.log(`   Variants inserted:  ${variantsInserted}`);
    console.log(`   Pricing inserted:   ${pricingInserted}`);
    console.log(`   Saved-products re-attached: ${savedReattached}/${savedRows.length}`);
    if (savedDropped.length) console.log(`   Saved-products with no name match: ${savedDropped.join(", ")}`);
    if (unmatchedSuppliers.size) console.log(`   ⚠️  Unmatched suppliers (no pricing row created): ${[...unmatchedSuppliers].join(", ")}`);
    console.log(`\n   Sample derived Cut Style values (${cutTypeSamples.length} shown of however many were set):`);
    for (const s of cutTypeSamples) console.log(`     ${s}`);
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
