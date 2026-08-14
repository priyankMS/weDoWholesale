"use client";

import { useToast } from "@/components/portal/ToastProvider";

// The mockup itself defers the cart/checkout flow to Phase 3 ("Cart opens
// in Phase 3") — there's no cart backend yet for this pill to open, so it
// stays a toast affordance until that phase is built.
export function CartPill() {
  const showToast = useToast();

  return (
    <button
      type="button"
      onClick={() => showToast("Cart & checkout — coming in Phase 3")}
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary-500 px-3.5 py-2 text-[0.82rem] font-bold text-white transition-colors hover:bg-primary-600"
    >
      🛒 Cart
      <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[0.68rem] font-extrabold text-primary-600">
        0
      </span>
    </button>
  );
}
