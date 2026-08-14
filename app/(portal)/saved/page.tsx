"use client";

import useSWR from "swr";
import Link from "next/link";
import { fetchAllProducts } from "@/lib/api/catalogue";
import { useSavedProducts } from "@/lib/hooks/useSavedProducts";
import { useToast } from "@/components/portal/ToastProvider";

export default function SavedPage() {
  const { data: products, isLoading } = useSWR("catalogue-products", fetchAllProducts, {
    fallbackData: [],
  });
  const { savedIds, toggle } = useSavedProducts();
  const showToast = useToast();

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
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-3.5"
              >
                <Link
                  href={`/products/${p.id}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-primary-50 text-[1.6rem]"
                >
                  {p.icon}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${p.id}`}
                    className="block truncate text-[0.9rem] font-bold text-neutral-900"
                  >
                    {p.name}
                  </Link>
                  <div className="text-[0.72rem] text-neutral-400">
                    {p.category}
                    {p.type ? ` · ${p.type}` : ""}
                  </div>
                  <div className="font-serif text-[1rem] font-bold text-primary-600">
                    {p.minPrice != null ? `$${p.minPrice.toFixed(2)} / ${p.unit}` : "Contact for pricing"}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => showToast(`${p.name} added to cart ✓`)}
                    className="rounded-[8px] bg-primary-500 px-3 py-1.5 text-[0.76rem] font-extrabold whitespace-nowrap text-white hover:bg-primary-600"
                  >
                    Add to cart
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    className="text-[0.72rem] font-semibold text-neutral-400 hover:text-primary-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
