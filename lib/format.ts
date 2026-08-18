export function formatPrice(price: number | null, unit: string): string {
  if (price == null) return "Contact for pricing";
  return `$${price.toFixed(2)} / ${unit}`;
}

export function stockLabel(state: "in" | "low" | "out"): string {
  if (state === "in") return "● In stock";
  if (state === "low") return "◐ Low stock";
  return "○ Out of stock";
}

// Real variants carry condition/bone/skin, not the mockup's fictional
// named cuts ("Whole", "Trimmed Fat" etc). Lives here (not
// lib/db/queries/catalogue.ts) because it's imported from client
// components — that module pulls in Sequelize/pg and can't be imported
// from the browser bundle.
export function variantLabel(variant: {
  conditionType?: string | null;
  boneType?: string | null;
  skinType?: string | null;
}): string {
  const parts = [variant.conditionType, variant.boneType, variant.skinType].filter(
    (v): v is string => !!v && v.trim().length > 0,
  );
  return parts.length ? parts.join(" · ") : "Standard";
}
