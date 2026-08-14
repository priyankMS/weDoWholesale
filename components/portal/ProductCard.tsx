"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/portal/ToastProvider";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { stockLabel } from "@/lib/format";
import type { ProductSummary } from "@/lib/db/queries/catalogue";

const STOCK_CLASS: Record<string, string> = {
  in: "bg-green-50 text-green-600",
  low: "bg-amber-50 text-amber-700",
  out: "bg-neutral-100 text-neutral-400",
};

const CONDITION_CLASS: Record<string, string> = {
  Fresh: "bg-green-50 text-green-600",
  Frozen: "bg-blue-50 text-blue-700",
};

export function ProductCard({
  product,
  saved,
  onToggleSave,
  expandable = true,
}: {
  product: ProductSummary;
  saved: boolean;
  onToggleSave: () => void;
  expandable?: boolean;
}) {
  const showToast = useToast();
  const [expanded, setExpanded] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? null,
  );
  const [qty, setQty] = useState(10);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0] ?? null;
  const displayPrice = selectedVariant ? selectedVariant.price : product.minPrice;
  const condition = selectedVariant?.conditionType;

  function addToCart() {
    showToast(`${product.name} added to cart ✓`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  const head = (
    <div
      className={`flex items-center justify-between gap-3 px-3.5 py-3 ${
        expandable ? "cursor-pointer" : ""
      }`}
      onClick={expandable ? () => setExpanded((v) => !v) : undefined}
    >
      <div className="flex min-w-0 items-center gap-2.75">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-primary-50 text-[1.7rem]">
          {product.icon}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[0.93rem] font-bold text-neutral-900">
            {product.name}
          </div>
          <div className="mb-0.75 flex items-center gap-1.25">
            <span className="font-serif text-[1.1rem] font-bold text-primary-600">
              {displayPrice != null ? `$${displayPrice.toFixed(2)}` : "—"}
            </span>
            {displayPrice != null && (
              <span className="text-[0.7rem] font-medium text-neutral-400">
                / {product.unit}
              </span>
            )}
            <span
              className={`rounded-full px-1.75 py-0.5 text-[0.66rem] font-bold ${STOCK_CLASS[product.stockState]}`}
            >
              {stockLabel(product.stockState)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.25">
            {condition && (
              <span
                className={`rounded-md px-1.75 py-0.5 text-[0.62rem] font-bold ${CONDITION_CLASS[condition] ?? "bg-neutral-100 text-neutral-500"}`}
              >
                {condition}
              </span>
            )}
            {product.type && (
              <span className="rounded-md border border-neutral-200 bg-neutral-50 px-1.75 py-0.5 text-[0.62rem] font-bold text-neutral-500">
                {product.type}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          aria-label={saved ? "Remove from saved" : "Save"}
          className={`p-1 text-[1.1rem] transition-colors ${saved ? "text-primary-500" : "text-neutral-300"}`}
        >
          {saved ? "♥" : "♡"}
        </button>
        {expandable && (
          <span
            className={`text-[0.85rem] text-neutral-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white">
      {expandable ? head : <Link href={`/products/${product.id}`}>{head}</Link>}

      {expandable && expanded && (
        <div className="border-t border-neutral-200 px-3.5 pt-3 pb-3.5">
          {product.variants.length > 0 && (
            <>
              <div className="mb-2 text-[0.66rem] font-extrabold tracking-wide text-neutral-400 uppercase">
                Select cut
              </div>
              <div className="mb-3 flex flex-wrap gap-1.75">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`rounded-full border-[1.5px] px-3 py-1.5 text-[0.78rem] font-semibold ${
                      v.id === selectedVariantId
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-neutral-200 bg-neutral-50 text-neutral-700"
                    }`}
                  >
                    {v.label}
                    {v.price != null ? ` · $${v.price.toFixed(2)}` : ""}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex items-center gap-2.5">
            <QtyStepper value={qty} onChange={setQty} />
            <button
              type="button"
              onClick={addToCart}
              className={`h-10.5 flex-1 rounded-[10px] text-[0.88rem] font-extrabold text-white transition-colors ${
                justAdded ? "bg-green-600" : "bg-primary-500 hover:bg-primary-600"
              }`}
            >
              {justAdded ? "✓ Added" : "Add to cart"}
            </button>
          </div>

          <Link
            href={`/products/${product.id}`}
            className="mt-2.5 inline-block text-[0.8rem] font-bold text-primary-500"
          >
            View full details →
          </Link>
        </div>
      )}
    </div>
  );
}
