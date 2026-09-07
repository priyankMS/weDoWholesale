"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetchAllProducts } from "@/lib/api/catalogue";
import { useSavedProducts } from "@/lib/hooks/useSavedProducts";
import { ProductCard } from "@/components/portal/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

type View = "grid" | "list";

export default function SavedPage() {
  const { data: products, isLoading } = useSWR("catalogue-products", fetchAllProducts, {
    fallbackData: [],
  });
  const { savedIds, toggle } = useSavedProducts();
  const [view, setView] = useState<View>("list");

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
          <div className="flex items-center justify-between px-4 pt-4 pb-2.5 lg:px-0 lg:pt-6">
            <div className="text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
              {saved.length} saved item{saved.length !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center overflow-hidden rounded-full border-[1.5px] border-neutral-200">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setView("grid")}
                className={`px-2.5 py-1.5 text-[0.85rem] ${view === "grid" ? "bg-primary-500 text-white" : "bg-white text-neutral-400"}`}
              >
                ⊞
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setView("list")}
                className={`px-2.5 py-1.5 text-[0.85rem] ${view === "list" ? "bg-primary-500 text-white" : "bg-white text-neutral-400"}`}
              >
                ☰
              </button>
            </div>
          </div>
          <div
            className={`flex flex-col gap-2.5 px-4 lg:px-0 ${view === "grid" ? "grid grid-cols-2 lg:grid-cols-3" : ""}`}
          >
            {saved.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                saved
                onToggleSave={() => toggle(p.id)}
                layout={view}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
