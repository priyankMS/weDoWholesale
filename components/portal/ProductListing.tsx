"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/portal/ProductCard";
import {
  FilterDrawer,
  EMPTY_FILTERS,
  countActiveFilters,
  type FilterState,
} from "@/components/portal/FilterDrawer";
import { useSavedProducts } from "@/lib/hooks/useSavedProducts";
import type { ProductSummary } from "@/lib/db/queries/catalogue";

type Sort = "default" | "price-asc" | "price-desc" | "name-asc" | "stock";

export function ProductListing({
  products,
  parts,
}: {
  products: ProductSummary[];
  parts: string[];
}) {
  const { savedIds, toggle } = useSavedProducts();
  const [search, setSearch] = useState("");
  const [part, setPart] = useState("All");
  const [sort, setSort] = useState<Sort>("default");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const conditionOptions = useMemo(
    () =>
      Array.from(
        new Set(products.flatMap((p) => p.variants.map((v) => v.conditionType).filter(Boolean))),
      ) as string[],
    [products],
  );
  const boneOptions = useMemo(
    () =>
      Array.from(
        new Set(products.flatMap((p) => p.variants.map((v) => v.boneType).filter(Boolean))),
      ) as string[],
    [products],
  );
  const skinOptions = useMemo(
    () =>
      Array.from(
        new Set(products.flatMap((p) => p.variants.map((v) => v.skinType).filter(Boolean))),
      ) as string[],
    [products],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.filter((p) => {
      if (part !== "All" && p.type !== part) return false;
      if (q && !p.name.toLowerCase().includes(q) && !(p.type ?? "").toLowerCase().includes(q))
        return false;
      if (filters.condition.length && !p.variants.some((v) => v.conditionType && filters.condition.includes(v.conditionType)))
        return false;
      if (filters.bone.length && !p.variants.some((v) => v.boneType && filters.bone.includes(v.boneType)))
        return false;
      if (filters.skin.length && !p.variants.some((v) => v.skinType && filters.skin.includes(v.skinType)))
        return false;
      if (filters.stock.length && !filters.stock.includes(p.stockState)) return false;
      if (filters.priceMin != null && (p.minPrice == null || p.minPrice < filters.priceMin))
        return false;
      if (filters.priceMax != null && (p.minPrice == null || p.minPrice > filters.priceMax))
        return false;
      return true;
    });

    if (sort === "price-asc")
      list = [...list].sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
    if (sort === "price-desc")
      list = [...list].sort((a, b) => (b.minPrice ?? -Infinity) - (a.minPrice ?? -Infinity));
    if (sort === "name-asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "stock")
      list = [...list].sort((a, b) => (a.stockState === "in" ? 0 : 1) - (b.stockState === "in" ? 0 : 1));

    return list;
  }, [products, search, part, sort, filters]);

  const activeCount = countActiveFilters(filters);

  return (
    <div className="pb-4">
      <div className="px-4 pt-3 pb-2 lg:px-0">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[1rem] text-neutral-400">
            🔍
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cuts, type, products…"
            className="w-full rounded-[10px] border-[1.5px] border-neutral-200 bg-white py-3 pr-3.5 pl-10.5 text-[0.9rem] text-neutral-900 outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {parts.length > 1 && (
        <div className="scrollbar-none mb-2 flex gap-1.75 overflow-x-auto px-4 pb-0.5 lg:px-0">
          {["All", ...parts].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPart(p)}
              className={`shrink-0 rounded-full border-[1.5px] px-3.5 py-1.75 text-[0.78rem] font-semibold whitespace-nowrap ${
                p === part
                  ? "border-primary-500 bg-primary-500 text-white"
                  : "border-neutral-200 bg-white text-neutral-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="mb-2 flex items-center justify-between px-4 lg:px-0">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={`flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1.75 text-[0.78rem] font-bold ${
            activeCount > 0
              ? "border-primary-500 bg-primary-50 text-primary-500"
              : "border-neutral-200 bg-white text-neutral-900"
          }`}
        >
          ⚙ Filters
          {activeCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[0.65rem] font-extrabold text-white">
              {activeCount}
            </span>
          )}
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-full border-[1.5px] border-neutral-200 bg-white px-3 py-1.75 text-[0.76rem] font-semibold text-neutral-900 outline-none"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to high</option>
          <option value="price-desc">Price: High to low</option>
          <option value="name-asc">Name: A–Z</option>
          <option value="stock">In stock first</option>
        </select>
      </div>

      <div className="px-4 pb-2 text-[0.74rem] font-medium text-neutral-400 lg:px-0">
        Showing <strong className="text-neutral-900">{visible.length}</strong> of{" "}
        <strong className="text-neutral-900">{products.length}</strong> products
      </div>

      {visible.length === 0 ? (
        <div className="px-6 py-10 text-center text-[0.9rem] text-neutral-400">
          No products match your filters.
          <br />
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="mt-3 font-bold text-primary-500"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 px-4 lg:grid lg:grid-cols-2 lg:px-0 xl:grid-cols-3">
          {visible.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              saved={savedIds.has(p.id)}
              onToggleSave={() => toggle(p.id)}
            />
          ))}
        </div>
      )}

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        conditionOptions={conditionOptions}
        boneOptions={boneOptions}
        skinOptions={skinOptions}
        filters={filters}
        onChange={setFilters}
      />
    </div>
  );
}
