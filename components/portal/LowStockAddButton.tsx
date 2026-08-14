"use client";

import { useToast } from "@/components/portal/ToastProvider";

export function LowStockAddButton({ name }: { name: string }) {
  const showToast = useToast();

  return (
    <button
      type="button"
      onClick={() => showToast(`${name} added to cart ✓`)}
      className="ml-auto shrink-0 rounded-[8px] bg-primary-500 px-3 py-1.5 text-[0.76rem] font-extrabold text-white hover:bg-primary-600"
    >
      Add
    </button>
  );
}
