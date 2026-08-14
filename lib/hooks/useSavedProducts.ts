"use client";

import useSWR from "swr";
import { fetchSavedIds, toggleSaved } from "@/lib/api/catalogue";

const SAVED_KEY = "saved-products";

// Shared SWR cache so every screen that shows a heart/save button (product
// listing, detail, saved) reflects the same state without a full reload —
// toggling in one place revalidates everywhere else subscribed to this key.
export function useSavedProducts() {
  const { data, isLoading, mutate } = useSWR(SAVED_KEY, fetchSavedIds, {
    fallbackData: [],
  });

  const savedIds = new Set(data ?? []);

  async function toggle(productId: number) {
    const wasSaved = savedIds.has(productId);
    const optimistic = wasSaved
      ? (data ?? []).filter((id) => id !== productId)
      : [...(data ?? []), productId];

    await mutate(
      async () => {
        const res = await toggleSaved(productId);
        return res.saved
          ? [...(data ?? []).filter((id) => id !== productId), productId]
          : (data ?? []).filter((id) => id !== productId);
      },
      { optimisticData: optimistic, rollbackOnError: true },
    );
  }

  return { savedIds, isLoading, toggle };
}
