"use client";

import useSWR from "swr";
import { fetchAllProducts } from "@/lib/api/catalogue";
import { useSavedProducts } from "@/lib/hooks/useSavedProducts";
import { ProductCard } from "@/components/portal/ProductCard";

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
        <div className="px-8 py-14 text-center">
          <div className="mb-3 text-[3.5rem]">♡</div>
          <div className="mb-2 font-serif text-[1.2rem] font-bold text-neutral-900">
            No saved items yet
          </div>
          <div className="text-[0.84rem] leading-relaxed text-neutral-500">
            Tap the heart icon on any product to save it here for quick
            access.
          </div>
        </div>
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
