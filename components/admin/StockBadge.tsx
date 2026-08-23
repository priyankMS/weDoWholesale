import type { StockState } from "@/lib/db/queries/catalogue";

const styles = {
  in: "bg-green-100 text-green-700",
  low: "bg-amber-100 text-amber-700",
  out: "bg-red-100 text-red-700",
} as const;

const labels = { in: "In stock", low: "Low stock", out: "Out of stock" } as const;

export function StockBadge({ state }: { state: StockState }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[0.78rem] font-bold ${styles[state]}`}>
      {labels[state]}
    </span>
  );
}
