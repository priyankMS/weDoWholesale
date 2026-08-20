"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { fetchAllProducts } from "@/lib/api/catalogue";
import { useSavedProducts } from "@/lib/hooks/useSavedProducts";
import { ProductCard } from "@/components/portal/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

type Sort = "default" | "price-asc" | "price-desc";

export default function SearchPage() {
  const { data: products, isLoading } = useSWR("catalogue-products", fetchAllProducts, {
    fallbackData: [],
  });
  const { savedIds, toggle } = useSavedProducts();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("default");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    let list = (products ?? []).filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.type ?? "").toLowerCase().includes(q) ||
        p.variants.some((v) => v.label.toLowerCase().includes(q)),
    );
    if (sort === "price-asc")
      list = [...list].sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
    if (sort === "price-desc")
      list = [...list].sort((a, b) => (b.minPrice ?? -Infinity) - (a.minPrice ?? -Infinity));
    return list;
  }, [products, query, sort]);

  return (
    <div className="pb-4">
      <div className="px-4 pt-4 pb-2 lg:px-0 lg:pt-6">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[0.95rem] text-neutral-400">
            🔍
          </span>
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all products…"
            className="w-full rounded-[10px] border-[1.5px] border-primary-500 bg-white py-3 pr-3.5 pl-10.5 text-[0.9rem] text-neutral-900 outline-none"
          />
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between px-4 lg:px-0">
        <div className="text-[0.8rem] text-neutral-400">
          {!query.trim() ? (
            "Type to search all products"
          ) : (
            <>
              <strong className="text-neutral-900">{results.length}</strong> result
              {results.length !== 1 ? "s" : ""} for &ldquo;
              <strong className="text-neutral-900">{query}</strong>&rdquo;
            </>
          )}
        </div>
        {query.trim() && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border-[1.5px] border-neutral-200 bg-white px-3 py-1.5 text-[0.72rem] font-semibold text-neutral-900 outline-none"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
          </select>
        )}
      </div>

      {!query.trim() ? (
        <EmptyState icon="🔍" title="Search all products">
          Search across beef, lamb, chicken, goat, fish, drinks and more by
          name, type, or cut.
        </EmptyState>
      ) : isLoading ? (
        <div className="px-8 py-12 text-center text-[0.9rem] text-neutral-400">Loading…</div>
      ) : results.length === 0 ? (
        <EmptyState icon="😕" title="No results found">
          Try a different search term — product name, cut, or category.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-2.5 px-4 lg:grid lg:grid-cols-2 lg:px-0 xl:grid-cols-3">
          {results.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              saved={savedIds.has(p.id)}
              onToggleSave={() => toggle(p.id)}
              expandable={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
