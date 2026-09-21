"use client";

import { useEffect, useRef, useState } from "react";
import { searchAdminCatalogue, type AdminCatalogueVariant } from "@/lib/api/adminOrders";
import { ProductPicker, type PickedProduct } from "@/components/admin/ProductPicker";
import { AddVariantForm } from "@/components/admin/AddVariantForm";
import { getAdminVariantFacets, type AdminVariantFacets } from "@/lib/api/adminVariants";

export type PickedVariant = {
  productId: number;
  variantId: number;
  label: string;
  unit: string;
  unitPrice: number | null;
};

// Sub-header inside a category is the product name with the category's own
// name stripped off the front (e.g. category "Beef", product "Beef Bones" ->
// "Bones") so the tree doesn't repeat "Beef" at every level.
function subLabel(productName: string, category: string): string {
  if (!category) return productName;
  const prefix = `${category} `;
  return productName.toLowerCase().startsWith(prefix.toLowerCase())
    ? productName.slice(prefix.length)
    : productName;
}

type CatalogueProduct = { id: number; name: string; category: string; unit: string; variants: AdminCatalogueVariant[] };

function groupByCategory(products: CatalogueProduct[]): { category: string; products: CatalogueProduct[] }[] {
  const groups = new Map<string, CatalogueProduct[]>();
  for (const product of products) {
    const key = product.category || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(product);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, products]) => ({ category, products }));
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3 w-3 shrink-0 fill-none stroke-[#9a9490] stroke-2 transition-transform ${open ? "rotate-90" : ""}`}
    >
      <path d="M6 3.5l5 4.5-5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductVariantPicker({
  onSelect,
  placeholder = "Search product or SKU…",
}: {
  onSelect: (picked: PickedVariant) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogueProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  // Collapsed nodes only — a fresh search starts with every category and
  // product expanded (a few matches at a time, so there's nothing to hide
  // yet); collapsing is opt-in per node from there, same as a file tree.
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [collapsedProducts, setCollapsedProducts] = useState<Set<number>>(new Set());

  // "Can't find it?" inline variant-creation flow — picks the product (if
  // not already obvious from the search box), then reuses the same
  // AddVariantForm the catalogue admin screens use. Kept local to this
  // component (rather than reusing AddVariantModal as-is) because on
  // success it needs to auto-select the freshly created variant through
  // this same picker's onSelect, not just refresh the page.
  const [creating, setCreating] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState<PickedProduct | null>(null);
  const [facets, setFacets] = useState<AdminVariantFacets | undefined>(undefined);
  const pendingSelectId = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const products = await searchAdminCatalogue(query);
        setResults(products);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query, open, refreshToken]);

  // Once a freshly created variant shows up in a re-fetched results list,
  // finish the job by selecting it through the normal path — same
  // canonical label/price the rest of the tree uses, no need to duplicate
  // that formatting here.
  useEffect(() => {
    if (pendingSelectId.current == null) return;
    for (const product of results) {
      const variant = product.variants.find((v) => v.id === pendingSelectId.current);
      if (variant) {
        onSelect({
          productId: product.id,
          variantId: variant.id,
          label: `${product.name}${variant.label && variant.label !== "Standard" ? ` (${variant.label})` : ""}`,
          unit: product.unit,
          unitPrice: variant.price,
        });
        pendingSelectId.current = null;
        setOpen(false);
        setQuery("");
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  function toggleCategory(category: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  function toggleProduct(productId: number) {
    setCollapsedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function startCreating() {
    setCreating(true);
    setCreatingProduct(null);
    if (!facets) {
      getAdminVariantFacets()
        .then(setFacets)
        .catch(() => setFacets(undefined));
    }
  }

  function cancelCreating() {
    setCreating(false);
    setCreatingProduct(null);
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded border border-[#d0ccc6] px-2.5 py-1.5 text-[13px] outline-none focus:border-[#e05a4a]"
      />
      {open && (
        <div className="absolute z-20 mt-1 w-[30rem] max-w-[90vw] overflow-hidden rounded-md border border-[#e4e1dc] bg-white shadow-xl">
          <div className="sticky top-0 flex items-center justify-between border-b border-[#f0ede9] bg-white px-3 py-1.5">
            <span className="text-[11px] font-bold tracking-wide text-[#9a9490] uppercase">Results</span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                cancelCreating();
              }}
              aria-label="Close"
              className="rounded px-1.5 py-0.5 text-[15px] leading-none font-bold text-[#9a9490] hover:bg-[#f5f3f0] hover:text-[#5a5450]"
            >
              ×
            </button>
          </div>

          {creating ? (
            <div className="max-h-96 overflow-y-auto p-3">
              {!creatingProduct ? (
                <>
                  <div className="mb-1.5 text-[12px] font-semibold tracking-wide text-[#9a9490] uppercase">
                    Which product is this a new variant of?
                  </div>
                  <ProductPicker onSelect={setCreatingProduct} />
                  <button
                    type="button"
                    onClick={cancelCreating}
                    className="mt-2.5 text-[12px] font-bold text-[#9a9490] hover:text-[#5a5450]"
                  >
                    ← Back to results
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-2 flex items-center justify-between rounded-md bg-[#f7f5f2] px-2.5 py-1.5 text-[13px]">
                    <span className="font-semibold text-[#1a1816]">{creatingProduct.name}</span>
                    <button
                      type="button"
                      onClick={() => setCreatingProduct(null)}
                      className="font-bold text-[#e05a4a] hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <AddVariantForm
                    productId={creatingProduct.id}
                    facets={facets}
                    defaultOpen
                    onCancel={cancelCreating}
                    onCreated={(result) => {
                      pendingSelectId.current = result.id;
                      cancelCreating();
                      setRefreshToken((t) => t + 1);
                    }}
                  />
                </>
              )}
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-y-auto">
                {loading && <div className="px-3 py-2 text-[13px] text-[#9a9490]">Searching…</div>}
                {!loading && results.length === 0 && (
                  <div className="px-3 py-2 text-[13px] text-[#9a9490]">No matches.</div>
                )}
                {!loading &&
                  groupByCategory(results).map((group) => {
                    const categoryOpen = !collapsedCategories.has(group.category);
                    const variantCount = group.products.reduce((n, p) => n + p.variants.length, 0);
                    return (
                      <div key={group.category} className="border-b border-[#f0ede9] last:border-0">
                        <button
                          type="button"
                          onClick={() => toggleCategory(group.category)}
                          className="flex w-full items-center gap-1.5 bg-[#efece6] px-3 py-1.5 text-left text-[11px] font-bold tracking-wide text-[#5a5450] uppercase hover:bg-[#e8e4dd]"
                        >
                          <Chevron open={categoryOpen} />
                          <span>📁</span>
                          <span>{group.category}</span>
                          <span className="ml-auto text-[10px] font-semibold text-[#9a9490] normal-case">
                            {variantCount}
                          </span>
                        </button>
                        {categoryOpen && (
                          <div className="border-l border-[#e4e1dc] ml-[15px]">
                            {group.products.map((product) => {
                              const productOpen = !collapsedProducts.has(product.id);
                              return (
                                <div key={product.id}>
                                  <button
                                    type="button"
                                    onClick={() => toggleProduct(product.id)}
                                    className="flex w-full items-center gap-1.5 bg-[#faf9f7] px-3 py-1.5 pl-4 text-left text-[11px] font-bold tracking-wide text-[#9a9490] uppercase hover:bg-[#f5f3f0]"
                                  >
                                    <Chevron open={productOpen} />
                                    <span>📁</span>
                                    <span>{subLabel(product.name, group.category)}</span>
                                    <span className="ml-auto text-[10px] font-semibold normal-case">
                                      {product.variants.length}
                                    </span>
                                  </button>
                                  {productOpen && (
                                    <div className="border-l border-[#e4e1dc] ml-[19px]">
                                      {product.variants.map((v) => (
                                        <button
                                          key={v.id}
                                          type="button"
                                          onClick={() => {
                                            onSelect({
                                              productId: product.id,
                                              variantId: v.id,
                                              label: `${product.name}${v.label && v.label !== "Standard" ? ` (${v.label})` : ""}`,
                                              unit: product.unit,
                                              unitPrice: v.price,
                                            });
                                            setOpen(false);
                                            setQuery("");
                                          }}
                                          className="flex w-full items-center justify-between px-3 py-1.5 pl-4 text-left text-[13px] hover:bg-[#f5f3f0]"
                                        >
                                          <span className="text-[#1a1816]">
                                            {v.label} {v.sku ? <span className="text-[#9a9490]">· {v.sku}</span> : null}
                                          </span>
                                          <span className="font-semibold text-[#1a1816]">
                                            {v.price != null ? `$${v.price.toFixed(2)}` : "—"}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
              <button
                type="button"
                onClick={startCreating}
                className="block w-full border-t border-[#e4e1dc] bg-[#faf9f7] px-3 py-2 text-left text-[12px] font-bold text-[#e05a4a] hover:bg-[#fdf2f1]"
              >
                Can&apos;t find it? + Add a new variant
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
