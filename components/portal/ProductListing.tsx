"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { ProductCard, ProductCardSkeleton } from "@/components/portal/ProductCard";
import { CategorySidebar } from "@/components/portal/CategorySidebar";
import {
  FilterDrawer,
  EMPTY_FILTERS,
  countActiveFilters,
  type FilterState,
} from "@/components/portal/FilterDrawer";
import { useSavedProducts } from "@/lib/hooks/useSavedProducts";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { fetchProductPage, type ProductPageParams, type ProductPageResult } from "@/lib/api/catalogue";
import type { ProductQuerySort } from "@/lib/db/queries/catalogue";

type View = "grid" | "list";
type CategorySummary = { category: string; slug: string; icon: string; count: number };

const PAGE_SIZE = 10;
const EMPTY_FACETS = {
  types: [] as string[],
  typeCounts: {} as Record<string, number>,
  condition: [] as string[],
  bone: [] as string[],
  skin: [] as string[],
};

export function ProductListing({
  category,
  categories,
  activeSlug,
}: {
  category: string;
  categories: CategorySummary[];
  activeSlug: string;
}) {
  const { savedIds, toggle } = useSavedProducts();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [part, setPart] = useState("All");
  const [sort, setSort] = useState<ProductQuerySort>("default");
  const [view, setView] = useState<View>("grid");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filtersKey = JSON.stringify(filters);
  const chipDragStart = useRef<{ x: number; y: number } | null>(null);

  const getKey = (pageIndex: number, previous: ProductPageResult | null): ProductPageParams | null => {
    if (previous && !previous.hasMore) return null;
    return {
      category,
      q: debouncedSearch,
      type: part,
      condition: filters.condition,
      bone: filters.bone,
      skin: filters.skin,
      stock: filters.stock,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      sort,
      page: pageIndex + 1,
      pageSize: PAGE_SIZE,
    };
  };

  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetchProductPage, {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
  });

  // A search/filter/sort change invalidates every page already loaded — pull
  // pagination back to page 1 rather than re-fetching (and briefly showing)
  // pages 2+ under the old criteria.
  useEffect(() => {
    setSize(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, debouncedSearch, part, sort, filtersKey]);

  const isFirstLoad = !data;
  const isRefetching = isValidating && size === 1;
  const isFetchingMore = isValidating && size > 1;
  const showSkeleton = isFirstLoad || isRefetching;

  const products = useMemo(() => (data ? data.flatMap((page) => page.products) : []), [data]);
  const total = data?.[0]?.total ?? 0;
  const facets = data?.[0]?.facets ?? EMPTY_FACETS;
  const hasMore = data ? (data[data.length - 1]?.hasMore ?? false) : false;
  const activeCount = countActiveFilters(filters);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore || showSkeleton) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isValidating) setSize((s) => s + 1);
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, showSkeleton, isValidating, setSize]);

  return (
    <div className="pb-4 lg:flex lg:items-start lg:gap-8">
      <CategorySidebar
        categories={categories}
        activeSlug={activeSlug}
        conditionOptions={facets.condition}
        boneOptions={facets.bone}
        skinOptions={facets.skin}
        filters={filters}
        onChange={setFilters}
      />

      <div className="min-w-0 lg:flex-1">
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
            {search !== debouncedSearch && (
              <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[0.7rem] text-neutral-300">
                ⋯
              </span>
            )}
          </div>
        </div>

        {facets.types.length > 1 && (
          <div className="scrollbar-none mb-2 flex gap-1.75 overflow-x-auto px-4 pb-0.5 lg:px-0">
            {["All", ...facets.types].map((p) => {
              const count = p === "All" ? total : (facets.typeCounts[p] ?? 0);
              return (
                <button
                  key={p}
                  type="button"
                  onPointerDown={(e) => {
                    chipDragStart.current = { x: e.clientX, y: e.clientY };
                  }}
                  onClick={(e) => {
                    const start = chipDragStart.current;
                    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) return;
                    setPart(p);
                  }}
                  className={`shrink-0 rounded-full border-[1.5px] px-3.5 py-1.75 text-[0.78rem] font-semibold whitespace-nowrap ${
                    p === part
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  {p} <span className={p === part ? "text-white/80" : "text-neutral-400"}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mb-2 flex items-center justify-between gap-2 px-4 lg:justify-end lg:px-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1.75 text-[0.78rem] font-bold lg:hidden ${
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
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductQuerySort)}
              className="rounded-full border-[1.5px] border-neutral-200 bg-white px-3 py-1.75 text-[0.76rem] font-semibold text-neutral-900 outline-none"
            >
              <option value="default">Sort: Most popular</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
              <option value="name-asc">Name: A–Z</option>
              <option value="stock">In stock first</option>
            </select>
            <div className="hidden items-center overflow-hidden rounded-full border-[1.5px] border-neutral-200 lg:flex">
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
        </div>

        <div className="px-4 pb-2 text-[0.74rem] font-medium text-neutral-400 lg:px-0">
          {showSkeleton ? (
            "Loading products…"
          ) : (
            <>
              Showing <strong className="text-neutral-900">{products.length}</strong> of{" "}
              <strong className="text-neutral-900">{total}</strong> products
            </>
          )}
        </div>

        {showSkeleton ? (
          <div
            className={`flex flex-col gap-2.5 px-4 lg:px-0 ${view === "grid" ? "lg:grid lg:grid-cols-2 xl:grid-cols-3" : ""}`}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} layout={view} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-10 text-center text-[0.9rem] text-neutral-400">
            No products match your filters.
            <br />
            <button
              type="button"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setSearch("");
                setPart("All");
              }}
              className="mt-3 font-bold text-primary-500"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div
              className={`flex flex-col gap-2.5 px-4 lg:px-0 ${view === "grid" ? "lg:grid lg:grid-cols-2 xl:grid-cols-3" : ""}`}
            >
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  saved={savedIds.has(p.id)}
                  onToggleSave={() => toggle(p.id)}
                  layout={view}
                />
              ))}
              {isFetchingMore &&
                Array.from({ length: 3 }).map((_, i) => (
                  <ProductCardSkeleton key={`more-${i}`} layout={view} />
                ))}
            </div>

            <div ref={sentinelRef} className="h-1" />

            {hasMore && !isFetchingMore && (
              <div className="flex justify-center px-4 pt-4 lg:px-0">
                <button
                  type="button"
                  onClick={() => setSize((s) => s + 1)}
                  className="rounded-full border-[1.5px] border-neutral-200 bg-white px-5 py-2 text-[0.82rem] font-bold text-neutral-700"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}

        <FilterDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          conditionOptions={facets.condition}
          boneOptions={facets.bone}
          skinOptions={facets.skin}
          filters={filters}
          onChange={setFilters}
        />
      </div>
    </div>
  );
}
