"use client";

import { useToast } from "@/components/portal/ToastProvider";

// No order history exists yet (that lands with Phase 3's cart/checkout
// build) — honest placeholder rather than faking a "loaded into cart"
// success state for an order that was never actually placed.
export function RepeatOrderButton() {
  const showToast = useToast();

  return (
    <button
      type="button"
      onClick={() =>
        showToast("Reordering will be available after your first order")
      }
      className="w-full rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50 px-4 py-3.5 text-center text-[0.88rem] font-extrabold text-primary-600 transition-colors hover:bg-primary-100"
    >
      🔁 Repeat last order
    </button>
  );
}
