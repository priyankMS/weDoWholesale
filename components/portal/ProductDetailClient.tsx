"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/portal/ToastProvider";
import { useSavedProducts } from "@/lib/hooks/useSavedProducts";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { stockLabel } from "@/lib/format";
import type { ProductSummary } from "@/lib/db/queries/catalogue";

export function ProductDetailClient({
  product,
  sku,
}: {
  product: ProductSummary;
  shortDesc: string | null;
  longDesc: string | null;
  sku: string | null;
}) {
  const showToast = useToast();
  const { savedIds, toggle } = useSavedProducts();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? null,
  );
  const [qty, setQty] = useState(10);
  const [justAdded, setJustAdded] = useState(false);

  const saved = savedIds.has(product.id);
  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0] ?? null;
  const price = selectedVariant ? selectedVariant.price : product.minPrice;

  // Only the real fields that actually exist and vary in wdh_variants —
  // the mockup's spec table also had Origin, Slaughter method, Fat level
  // and Min. order rows, but none of those exist as columns on
  // wdh_products/wdh_variants (region/cuisine are always blank, and
  // there's no slaughter-method, fat-level or min-order column at all),
  // so they're left out rather than shown as fabricated placeholder text.
  const specRows = [
    { label: "Condition", value: selectedVariant?.conditionType },
    { label: "Bone", value: selectedVariant?.boneType },
    { label: "Skin", value: selectedVariant?.skinType },
    { label: "Category", value: product.category },
    { label: "Type", value: product.type },
    { label: "SKU", value: sku },
  ].filter((r) => r.value);

  function addToCart() {
    showToast(`${product.name} added to cart ✓`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <>
      <div className="mx-4 mt-1 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-5 text-center lg:mx-0">
        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-label={saved ? "Remove from saved" : "Save"}
          className={`float-right text-[1.3rem] ${saved ? "text-primary-500" : "text-neutral-300"}`}
        >
          {saved ? "♥" : "♡"}
        </button>
        <div className="mb-2.5 text-[5rem] leading-none">{product.icon}</div>
        <div className="mb-1.5 font-serif text-[1.45rem] font-black text-neutral-900">
          {product.name}
        </div>
        <div className="mb-3.5 flex flex-wrap justify-center gap-1.5">
          {selectedVariant?.conditionType && (
            <span className="rounded-md bg-green-50 px-2 py-0.75 text-[0.66rem] font-bold text-green-600">
              {selectedVariant.conditionType}
            </span>
          )}
          {product.type && (
            <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.75 text-[0.66rem] font-bold text-neutral-500">
              {product.type}
            </span>
          )}
          <span className="rounded-full bg-neutral-100 px-2 py-0.75 text-[0.66rem] font-bold text-neutral-500">
            {stockLabel(product.stockState)}
          </span>
        </div>
        <div className="flex items-baseline justify-center gap-1.5">
          <div className="font-serif text-[2rem] font-black text-primary-600">
            {price != null ? `$${price.toFixed(2)}` : "—"}
          </div>
          {price != null && (
            <div className="text-[0.84rem] font-medium text-neutral-400">/ {product.unit}</div>
          )}
        </div>
        {price == null && (
          <div className="mt-1 text-[0.78rem] font-semibold text-neutral-400">
            Contact for pricing
          </div>
        )}
      </div>

      {product.variants.length > 1 && (
        <div className="mx-4 mt-3.5 lg:mx-0">
          <div className="mb-2 px-0.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Select cut
          </div>
          <div className="flex flex-wrap gap-1.75">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantId(v.id)}
                className={`rounded-full border-[1.5px] px-3.25 py-1.75 text-[0.8rem] font-semibold ${
                  v.id === selectedVariantId
                    ? "border-primary-500 bg-primary-500 text-white"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {specRows.length > 0 && (
        <div className="mx-4 mt-3.5 lg:mx-0">
          <div className="mb-2 px-0.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Product details
          </div>
          <div className="overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white">
            {specRows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between border-b border-neutral-200 px-3.5 py-3 text-[0.86rem] last:border-none"
              >
                <span className="font-medium text-neutral-700">{r.label}</span>
                <span className="font-bold text-neutral-900">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-4 mt-3.5 lg:mx-0">
        <div className="mb-2 px-0.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
          Halal certification
        </div>
        <div className="flex items-center gap-3.5 rounded-2xl border-[1.5px] border-neutral-200 bg-white px-4 py-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-green-200 bg-green-50 text-lg">
            ✓
          </div>
          <div className="flex-1 text-[0.8rem] leading-snug text-neutral-700">
            All WeDoHalal products are sourced from certified halal
            suppliers.
          </div>
          <Link href="/halal-certs" className="shrink-0 text-[0.82rem] font-bold text-primary-500">
            View →
          </Link>
        </div>
      </div>

      <div className="h-4" />

      <div className="fixed inset-x-0 bottom-16 z-40 flex items-center gap-2.5 border-t-[1.5px] border-neutral-200 bg-white px-4 py-3 lg:static lg:mx-0 lg:mt-4 lg:rounded-2xl lg:border lg:px-4.5 lg:py-3.5">
        <QtyStepper value={qty} onChange={setQty} />
        <button
          type="button"
          onClick={addToCart}
          className={`h-10.5 flex-1 rounded-xl text-[0.92rem] font-extrabold text-white transition-colors ${
            justAdded ? "bg-green-600" : "bg-primary-500 hover:bg-primary-600"
          }`}
        >
          {justAdded ? "✓ Added to cart" : "Add to cart →"}
        </button>
      </div>
    </>
  );
}
