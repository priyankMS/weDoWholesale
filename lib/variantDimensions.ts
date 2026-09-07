import type { ProductSummary } from "@/lib/db/queries/catalogue";

// Shared by ProductCard's inline "Select cut" panel and
// ProductDetailClient's "Configure your order" buy box, so both surfaces
// present the client's reference design the same way: one button group per
// attribute (Condition, Cut Style, Bone, Skin, Fat, Origin, Supplier) the
// product actually has a value for — rather than one flat button per full
// SKU label. Cut Style sits right after Condition
// since it's usually the buyer's primary choice and the field most likely
// to change price. Supplier is last: several real products (e.g. Ground
// Chicken from multiple suppliers) have variants that are IDENTICAL on
// every other field and differ only by supplier/price — without this as
// its own dimension those collapsed into an ambiguous "Choose option" list
// of visually-identical buttons, which is the bug this fixes. ("Country of
// Origin" is `origin`/region below; the reference mockup's "Grind
// Coarseness", "Pack Weight" and "Slaughter Method" facets have no
// equivalent column in the current schema — they're specific to the
// static mockup's fictional Beef Ground product, not real catalog data —
// so they aren't offered as dimensions here.)
export type VariantDimensionKey =
  | "conditionType"
  | "cutType"
  | "boneType"
  | "skinType"
  | "fatLevel"
  | "origin"
  | "supplierName";

export const VARIANT_DIMENSIONS: { key: VariantDimensionKey; label: string }[] = [
  { key: "conditionType", label: "Condition" },
  { key: "cutType", label: "Cut Style" },
  { key: "boneType", label: "Bone" },
  { key: "skinType", label: "Skin" },
  { key: "fatLevel", label: "Fat" },
  { key: "origin", label: "Country of Origin" },
  { key: "supplierName", label: "Supplier" },
];

export function distinctDimensionValues(
  variants: ProductSummary["variants"],
  key: VariantDimensionKey,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of variants) {
    const val = v[key];
    if (val && !seen.has(val)) {
      seen.add(val);
      out.push(val);
    }
  }
  return out;
}

// Every dimension this product actually has a value for — matching the
// client's reference design (wedohalal-wholesale-v3_1.html), which always
// renders each applicable attribute as its own row (Skin/Fat Level still
// get a row with a single button when every variant shares one value —
// it's a spec, not a real choice, but still shown) rather than hiding
// single-valued fields. Selecting a single-value dimension's only button
// is a no-op for narrowing candidates, so this is purely a display change.
export function activeVariantDimensions(variants: ProductSummary["variants"]) {
  return VARIANT_DIMENSIONS.map((d) => ({ ...d, values: distinctDimensionValues(variants, d.key) })).filter(
    (d) => d.values.length >= 1,
  );
}

// Applies a click on one dimension button, keeping every other
// already-selected dimension that's still reachable in combination with the
// new pick and dropping the rest. Plain `{...prev, [key]: value}` can pin
// selections to a combination no variant actually has (e.g. Condition
// "Frozen" + a leftover Fat "Low" from the previous pick, when Frozen
// variants only come in blank/unspecified fat) — `candidates` then goes
// empty, the buy box silently falls back to the very first variant, and the
// click on Condition/Supplier/whatever looks like it did nothing. Dropping
// stale, now-incompatible selections instead of keeping them guarantees the
// clicked value always lands on a real variant.
export function resolveDimensionSelection(
  variants: ProductSummary["variants"],
  activeDimensions: { key: VariantDimensionKey }[],
  prevSelections: Record<string, string>,
  key: VariantDimensionKey,
  value: string,
): Record<string, string> {
  const next: Record<string, string> = { [key]: value };
  for (const d of activeDimensions) {
    if (d.key === key) continue;
    const sel = prevSelections[d.key];
    if (!sel) continue;
    const candidate = { ...next, [d.key]: sel };
    const stillMatches = variants.some((v) =>
      Object.entries(candidate).every(([k, val]) => v[k as VariantDimensionKey] === val),
    );
    if (stillMatches) next[d.key] = sel;
  }
  return next;
}
