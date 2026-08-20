import { orderStatusMeta, type OrderStatus } from "@/lib/format";

const TONE_CLASS = {
  pending: "bg-amber-50 text-amber-700 border-amber-300",
  transit: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-green-50 text-green-600 border-green-200",
  cancelled: "bg-neutral-100 text-neutral-400 border-neutral-200",
} as const;

export function OrderStatusBadge({ status }: { status: OrderStatus | null }) {
  const meta = orderStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.75 text-[0.68rem] font-extrabold ${TONE_CLASS[meta.tone]}`}
    >
      {meta.label}
    </span>
  );
}

export function PaidBadge({ paid, dueDate }: { paid: boolean; dueDate?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.75 text-[0.68rem] font-extrabold ${
        paid ? TONE_CLASS.paid : TONE_CLASS.pending
      }`}
    >
      {paid ? "Paid" : dueDate ? `Due ${dueDate}` : "Unpaid"}
    </span>
  );
}
