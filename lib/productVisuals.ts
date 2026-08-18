// Per-category gradient used behind the product emoji on cards. Lives
// separately from CATEGORY_ICONS (lib/db/queries/catalogue.ts) because
// that module pulls in Sequelize and can't be imported from client
// components — see the note in lib/format.ts for the same constraint.
const CATEGORY_GRADIENT: Record<string, [string, string]> = {
  Beef: ["#fde4e1", "#f3ada0"],
  Chicken: ["#fff3d6", "#ffd28f"],
  Lamb: ["#f3e8ff", "#d6b8f5"],
  Goat: ["#e8f5e9", "#b7e0bd"],
  Fish: ["#e0f4ff", "#9fd8f5"],
  Drinks: ["#e6f7f1", "#a8e3c8"],
  Groceries: ["#f0f0f0", "#d4d4d4"],
  Snacks: ["#fff0e6", "#ffc294"],
  Desserts: ["#fdeaf3", "#f5b0d4"],
};

const DEFAULT_GRADIENT: [string, string] = ["#f5f0ea", "#e2d4c2"];

export function categoryGradient(category: string): string {
  const [from, to] = CATEGORY_GRADIENT[category] ?? DEFAULT_GRADIENT;
  return `linear-gradient(135deg, ${from}, ${to})`;
}

// CATEGORY_ICONS (lib/db/queries/catalogue.ts) uses the live-animal emoji
// for the category tile grid ("Shop by category" — 🐄 Beef, 🐔 Chicken),
// which reads fine as a category label but wrong on an individual product
// card, where it looks like a picture of a live animal rather than a meat
// product. Product cards use this cut/food-appropriate set instead.
const PRODUCT_ICON: Record<string, string> = {
  Beef: "🥩",
  Chicken: "🍗",
  Lamb: "🍖",
  Goat: "🍖",
  Fish: "🐟",
  Drinks: "🧃",
  Groceries: "🛒",
  Snacks: "🍿",
  Desserts: "🍰",
};

export function productIcon(category: string): string {
  return PRODUCT_ICON[category] ?? "🍽";
}
