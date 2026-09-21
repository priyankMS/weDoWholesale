"use client";

import { useEffect, useState } from "react";
import { searchAdminCatalogue } from "@/lib/api/adminOrders";

export type PickedProduct = { id: number; name: string; category: string };

// Reuses the same admin catalogue search the order-revision picker
// (ProductVariantPicker) already calls — this one only needs the product
// itself (to know which product a new variant belongs to), not a specific
// existing variant, so it ignores the `variants` array in each result.
export function ProductPicker({
  onSelect,
  placeholder = "Search product name…",
}: {
  onSelect: (product: PickedProduct) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickedProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const products = await searchAdminCatalogue(query);
        setResults(products.map((p) => ({ id: p.id, name: p.name, category: p.category })));
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
        autoFocus
        className="w-full rounded-md border border-[#d0ccc6] px-3 py-2 text-[14px] outline-none focus:border-[#e05a4a]"
      />
      {open && (
        <div className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-[#e4e1dc] bg-white shadow-lg">
          {loading && <div className="px-3 py-2 text-[13px] text-[#9a9490]">Searching…</div>}
          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-[13px] text-[#9a9490]">No matches.</div>
          )}
          {!loading &&
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onSelect(p);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-[14px] hover:bg-[#f5f3f0]"
              >
                <span className="font-semibold text-[#1a1816]">{p.name}</span>
                <span className="text-[12px] text-[#9a9490]">{p.category}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
