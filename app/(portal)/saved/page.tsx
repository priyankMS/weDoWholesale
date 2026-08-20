"use client";

import useSWR from "swr";
import { fetchAllProducts } from "@/lib/api/catalogue";
import { useSavedProducts } from "@/lib/hooks/useSavedProducts";
import { ProductCard } from "@/components/portal/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SavedPage() {
  const { data: products, isLoading } = useSWR("catalogue-products", fetchAllProducts, {
    fallbackData: [],
  });
  const { savedIds, toggle } = useSavedProducts();

  const saved = (products ?? []).filter((p) => savedIds.has(p.id));

  return (
    <div className="pb-4">
      {isLoading ? (
        <div className="px-8 py-12 text-center text-[0.9rem] text-neutral-400">Loading…</div>
      ) : saved.length === 0 ? (
        <EmptyState icon="♡" title="No saved items yet">
          Tap the heart icon on any product to save it here for quick access.
        </EmptyState>
      ) : (
        <>
          <div className="px-4 pt-4 pb-2.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0 lg:pt-6">
            {saved.length} saved item{saved.length !== 1 ? "s" : ""}
          </div>
          <div className="flex flex-col gap-2.5 px-4 lg:grid lg:grid-cols-2 lg:px-0 xl:grid-cols-3">
            {saved.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                saved
                onToggleSave={() => toggle(p.id)}
                layout="list"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
