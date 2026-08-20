export function formatPrice(price: number | null, unit: string): string {
  if (price == null) return "Contact for pricing";
  return `$${price.toFixed(2)} / ${unit}`;
}

export function formatMoney(amount: number | null): string {
  if (amount == null) return "$0.00";
  return `$${amount.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string | Date, withYear = true): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${formatDate(d, false)} · ${d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" })}`;
}

// Screen 29's inbox thread list time column — today's messages show a
// clock time, yesterday's show "Yesterday", anything older shows a short
// date (with year only if it's not the current year).
export function inboxTimeLabel(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatDate(d, d.getFullYear() !== now.getFullYear());
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
}

export type PaymentTerms = "cod" | "net15" | "net30";

export function paymentTermsLabel(terms: PaymentTerms | null): string {
  switch (terms) {
    case "net15":
      return "Net 15";
    case "net30":
      return "Net 30";
    default:
      return "COD / Card only";
  }
}

export type OrderStatus =
  | "pending"
  | "new"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

// Order status → mockup's badge tone + label. Lives here (not
// lib/db/queries/account.ts) so it can be imported from client components
// without pulling in Sequelize.
export function orderStatusMeta(status: OrderStatus | null): {
  label: string;
  tone: "pending" | "transit" | "paid" | "cancelled";
} {
  switch (status) {
    case "shipped":
      return { label: "In transit", tone: "transit" };
    case "delivered":
      return { label: "Delivered", tone: "paid" };
    case "cancelled":
    case "returned":
      return { label: "Cancelled", tone: "cancelled" };
    case "new":
      return { label: "Confirmed", tone: "pending" };
    case "pending":
    default:
      return { label: "Pending", tone: "pending" };
  }
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
// Screen 29's .thread-tag pill tones (order = blue, support = amber,
// system = green) — reused by both the mobile inbox list and the desktop
// thread-list panel, so kept in this client-safe module rather than
// duplicated per component.
export type MessageThreadTagStyle = "order" | "support" | "system";

export function threadTagClass(style: MessageThreadTagStyle): string {
  switch (style) {
    case "order":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "system":
      return "bg-green-50 text-green-600 border-green-200";
    case "support":
    default:
      return "bg-amber-50 text-amber-700 border-amber-300";
  }
}

// Screen 31's .ann-tag pill tones (eid = pink, pricing = amber, newprod =
// green, ops = blue).
export type AnnouncementTag = "eid" | "pricing" | "newprod" | "ops";

export function announcementTagClass(tag: AnnouncementTag): string {
  switch (tag) {
    case "pricing":
      return "bg-amber-50 text-amber-700 border-amber-300";
    case "newprod":
      return "bg-green-50 text-green-600 border-green-200";
    case "ops":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "eid":
    default:
      return "bg-primary-50 text-primary-600 border-primary-200";
  }
}

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
