export function formatPrice(price: number | null, unit: string): string {
  if (price == null) return "Contact for pricing";
  return `$${price.toFixed(2)} / ${unit}`;
}

export function stockLabel(state: "in" | "low" | "out"): string {
  if (state === "in") return "● In stock";
  if (state === "low") return "◐ Low stock";
  return "○ Out of stock";
}
