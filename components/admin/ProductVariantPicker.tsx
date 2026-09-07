"use client";

import { useEffect, useState } from "react";
import { searchAdminCatalogue, type AdminCatalogueVariant } from "@/lib/api/adminOrders";

export type PickedVariant = {
  productId: number;
  variantId: number;
  label: string;
  unit: string;
  unitPrice: number | null;
};

export function ProductVariantPicker({
  onSelect,
  placeholder = "Search product or SKU…",
}: {
  onSelect: (picked: PickedVariant) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { id: number; name: string; category: string; unit: string; variants: AdminCatalogueVariant[] }[]
  >([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
  }, [query, open]);

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
        <div className="absolute z-10 mt-1 max-h-72 w-full min-w-72 overflow-y-auto rounded-md border border-[#e4e1dc] bg-white shadow-lg">
          <div className="sticky top-0 flex items-center justify-between border-b border-[#f0ede9] bg-white px-3 py-1">
            <span className="text-[11px] font-bold tracking-wide text-[#9a9490] uppercase">Results</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded px-1.5 py-0.5 text-[15px] leading-none font-bold text-[#9a9490] hover:bg-[#f5f3f0] hover:text-[#5a5450]"
            >
              ×
            </button>
          </div>
          {loading && <div className="px-3 py-2 text-[13px] text-[#9a9490]">Searching…</div>}
          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-[13px] text-[#9a9490]">No matches.</div>
          )}
          {!loading &&
            results.map((product) => (
              <div key={product.id} className="border-b border-[#f0ede9] last:border-0">
                <div className="bg-[#faf9f7] px-3 py-1 text-[11px] font-bold tracking-wide text-[#9a9490] uppercase">
                  {product.name}
                </div>
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
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] hover:bg-[#f5f3f0]"
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
            ))}
        </div>
      )}
    </div>
  );
}
