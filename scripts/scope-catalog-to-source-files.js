/* eslint-disable @typescript-eslint/no-require-imports -- one-off Node/CommonJS ops script, run directly via `node`, not part of the Next.js bundle */
/**
 * Scopes the live catalog to EXACTLY the 115 meat groups in the source
 * files (wedohalal_wholesale_import_developer.xlsx / groups_import.csv),
 * per explicit user instruction: remove anything not in those files
 * (all non-meat categories, plus a handful of extra/test meat products
 * that predate this catalog), and add the 2 groups the files have that
 * the live staging import never got (Turkey Whole, Ground Lamb).
 *
 * Safety checks done before writing this script (see chat/memory):
 *   - saved_products.product_id: 0 rows reference any product being removed.
 *   - order_items.product_id: has NO FK to wdh_products at all, and sample
 *     rows confirm it addresses a completely different (legacy) id space
 *     (e.g. product_id 1006 "Whole Chicken With Skin" doesn't exist in
 *     wdh_products; another id coincidentally exists but names a different
 *     item) — deleting wdh_products rows cannot affect order history.
 *   - wdh_variant_pricing -> wdh_variants -> wdh_products all cascade via
 *     ON DELETE CASCADE per the original migrations, but this script
 *     deletes explicitly in child-to-parent order anyway, inside one
 *     transaction, so nothing depends on that.
 *
 * Usage: node scripts/scope-catalog-to-source-files.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");

const MATCHED_LIVE_IDS = fs
  .readFileSync("/tmp/matched_live_ids.txt", "utf-8")
  .trim()
  .split(",")
  .map(Number);

// The 2 catalog groups with no live counterpart at all (see
// reconcile-meat-catalog.js's header note) — added now with full data from
// the same source files used for everything else.
const MISSING_GROUPS = [
  {
    name: "Turkey Whole",
    category: "Turkey",
    metaTitle: "Wholesale Turkey Whole | Bulk Halal Turkey Supplier - WeDoHalal.com",
    metaDesc: "Order wholesale turkey whole in bulk, frozen available. Competitive per-kg pricing for restaurants, grocers, and mosques. Edmonton pickup or delivery.",
    shortDesc: "Enjoy our whole turkey with skin, halal-certified, perfect for festive occasions, offering lean, high-quality protein and a rich taste.",
    longDescHeading: "Festive Whole Halal Turkey",
    region: "Arab| African| Asian",
    cuisine: "Turkey Roast| Turkey Biryani| Turkey Stew",
    variants: [
      {
        condition: "Frozen", skin: "With Skin", bone: "With Bone", fat: "Medium",
        origin: "Alberta, Canada", supplier: "Karim Meats",
        supplierPrice: null, retailPrice: 5.49, wholesalePrice: 12.1,
        stockStatus: "instock", stockCount: 1,
        image: "https://images.wedohalal.com/products/Turkey-(Whole-With-Skin)-93.webp",
      },
    ],
  },
  {
    name: "Ground Lamb",
    category: "Lamb",
    metaTitle: "Wholesale Lamb Ground | Bulk Halal Lamb Supplier - WeDoHalal.com",
    metaDesc: "Order wholesale lamb ground in bulk, fresh available. Competitive per-kg pricing for restaurants, grocers, and mosques. Edmonton pickup or delivery.",
    shortDesc: "A rich blend of beef and lamb, offering a versatile option for meatballs, kabobs, and mixed meat dishes.",
    longDescHeading: "Rich Mixed Beef and Lamb Ground for Diverse Dishes",
    region: "Arab| African",
    cuisine: "Mixed Beef and Lamb Ground| Kofta| Mixed Meat Biryani",
    variants: [
      {
        condition: "Fresh", skin: "Skinless", bone: "Boneless", fat: "Medium",
        origin: "Alberta, Canada", supplier: "Westgate Halal",
        supplierPrice: null, retailPrice: 10.45, wholesalePrice: 23.04,
        stockStatus: "instock", stockCount: 1,
        image: "https://images.wedohalal.com/products/Mixed-Beef-And-Lamb-Ground-213.webp",
      },
      {
        condition: "Fresh", skin: "Skinless", bone: "Boneless", fat: "Medium",
        origin: "Alberta, Canada", supplier: "Karim Meats",
        supplierPrice: null, retailPrice: 10.99, wholesalePrice: 24.23,
        stockStatus: "instock", stockCount: 1,
        image: "https://images.wedohalal.com/products/Mixed-Beef-And-Lamb-Ground-1045.webp",
      },
    ],
  },
];

const SUPPLIER_ID_MAP = { "karim meats": 1, "westgate halal": 2 };

async function main() {
  console.log(`\n📦 Scoping catalog to source files`);
  console.log(`   Keeping ${MATCHED_LIVE_IDS.length} matched products`);
  console.log(`   Adding ${MISSING_GROUPS.length} groups missing from live DB`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE WRITE"}\n`);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wedohalal_wholesale",
  });

  try {
    await conn.beginTransaction();

    const placeholders = MATCHED_LIVE_IDS.map(() => "?").join(",");

    const [[{ toRemove }]] = await conn.query(
      `SELECT COUNT(*) as toRemove FROM wdh_products WHERE id NOT IN (${placeholders})`,
      MATCHED_LIVE_IDS,
    );
    console.log(`🗑  Products to remove: ${toRemove}`);

    const [[{ variantsToRemove }]] = await conn.query(
      `SELECT COUNT(*) as variantsToRemove FROM wdh_variants WHERE product_id NOT IN (${placeholders})`,
      MATCHED_LIVE_IDS,
    );
    console.log(`🗑  Variants to remove: ${variantsToRemove}`);

    await conn.execute(
      `DELETE vp FROM wdh_variant_pricing vp
       JOIN wdh_variants v ON v.id = vp.variant_id
       WHERE v.product_id NOT IN (${placeholders})`,
      MATCHED_LIVE_IDS,
    );
    await conn.execute(`DELETE FROM wdh_variants WHERE product_id NOT IN (${placeholders})`, MATCHED_LIVE_IDS);
    await conn.execute(`DELETE FROM wdh_products WHERE id NOT IN (${placeholders})`, MATCHED_LIVE_IDS);

    let productsAdded = 0;
    let variantsAdded = 0;
    let pricingAdded = 0;

    for (const g of MISSING_GROUPS) {
      const [productResult] = await conn.execute(
        `INSERT INTO wdh_products
           (category, item, has_variants, short_desc, long_desc_heading, meta_title, meta_desc, region, cuisine, created_at, updated_at)
         VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [g.category, g.name, g.shortDesc, g.longDescHeading, g.metaTitle, g.metaDesc, g.region, g.cuisine],
      );
      const productId = productResult.insertId;
      productsAdded += 1;

      for (let i = 0; i < g.variants.length; i++) {
        const v = g.variants[i];
        const sku = `NEW-${productId}-${String(i + 1).padStart(2, "0")}`;
        const [variantResult] = await conn.execute(
          `INSERT INTO wdh_variants
             (product_id, sku, condition_type, skin_type, bone_type, fat_level, region,
              base_price, stock_status, stock_count, per, thumbnail, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [productId, sku, v.condition, v.skin, v.bone, v.fat, v.origin, v.retailPrice, v.stockStatus, v.stockCount, "Price per lb", v.image],
        );
        const variantId = variantResult.insertId;
        variantsAdded += 1;

        const supplierId = SUPPLIER_ID_MAP[v.supplier.trim().toLowerCase()];
        if (supplierId) {
          await conn.execute(
            `INSERT INTO wdh_variant_pricing (variant_id, supplier_id, label, dealer_price, increment, retail_price, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [variantId, supplierId, v.supplier, v.supplierPrice, null, v.wholesalePrice, 1],
          );
          pricingAdded += 1;
        }
      }
    }

    if (DRY_RUN) {
      console.log("\n🧪 DRY RUN — rolling back (no changes committed)");
      await conn.rollback();
    } else {
      await conn.commit();
      console.log("\n✅ Transaction committed");
    }

    console.log(`\n📊 Results:`);
    console.log(`   Products removed:  ${toRemove}`);
    console.log(`   Variants removed:  ${variantsToRemove}`);
    console.log(`   Products added:    ${productsAdded}`);
    console.log(`   Variants added:    ${variantsAdded}`);
    console.log(`   Pricing added:     ${pricingAdded}`);
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error — rolled back:", err);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

main();
