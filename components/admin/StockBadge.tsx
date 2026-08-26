import type { StockState } from "@/lib/db/queries/catalogue";
import { AdminBadge, type AdminBadgeTone } from "@/components/admin/AdminBadge";

const tones: Record<StockState, AdminBadgeTone> = { in: "green", low: "amber", out: "red" };
const labels = { in: "In stock", low: "Low stock", out: "Out of stock" } as const;

export function StockBadge({ state }: { state: StockState }) {
  return <AdminBadge tone={tones[state]}>{labels[state]}</AdminBadge>;
}
