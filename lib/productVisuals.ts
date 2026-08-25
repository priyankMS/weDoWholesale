
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
