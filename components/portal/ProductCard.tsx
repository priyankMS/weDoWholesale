"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/portal/ToastProvider";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { stockLabel, variantLabel } from "@/lib/format";
import { categoryGradient, productIcon } from "@/lib/productVisuals";
import type { ProductSummary } from "@/lib/db/queries/catalogue";

type Layout = "grid" | "list";

const STOCK_CLASS: Record<string, string> = {
  in: "bg-green-50 text-green-600",
  low: "bg-amber-50 text-amber-700",
  out: "bg-neutral-100 text-neutral-400",
};

export function ProductCard({
  product,
  saved,
  onToggleSave,
  expandable = true,
  layout = "list",
}: {
  product: ProductSummary;
  saved: boolean;
  onToggleSave: () => void;
  expandable?: boolean;
  layout?: Layout;
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
  const meta = selectedVariant ? variantLabel(selectedVariant) : null;
  const metaLine = meta && meta !== "Standard" ? meta : product.type;
  const isWeighed = product.unit === "kg";
  const gradient = categoryGradient(product.category);
  const icon = productIcon(product.category);
  const imageUrl = selectedVariant?.image ?? product.image;

  function addToCart() {
    showToast(`${product.name} added to cart ✓`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  const saveButton = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggleSave();
      }}
      aria-label={saved ? "Remove from saved" : "Save"}
      className={`shrink-0 p-1 text-[1.1rem] transition-colors ${saved ? "text-primary-500" : "text-neutral-300"}`}
    >
      {saved ? "♥" : "♡"}
    </button>
  );

  const priceBlock = (
    <div>
      <div className="flex items-baseline gap-1.25">
        {displayPrice != null ? (
          <>
            <span className="font-serif text-[1.1rem] font-bold text-primary-600">
              ${displayPrice.toFixed(2)}
            </span>
            <span className="text-[0.7rem] font-medium text-neutral-400">
              / {product.unit}
              {isWeighed ? " est." : ""}
            </span>
          </>
        ) : (
          <span className="text-[0.82rem] font-semibold text-neutral-400">Contact for pricing</span>
        )}
        {product.stockState !== "in" && (
          <span
            className={`rounded-full px-1.75 py-0.5 text-[0.62rem] font-bold ${STOCK_CLASS[product.stockState]}`}
          >
            {stockLabel(product.stockState)}
          </span>
        )}
      </div>
      {isWeighed && displayPrice != null && (
        <div className="mt-0.25 text-[0.64rem] text-neutral-400">
          ⚖️ est. weight — adjusted on delivery
        </div>
      )}
    </div>
  );

  const addOrExpand = (
    <div className="flex shrink-0 items-center gap-1.5">
      {displayPrice != null && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            addToCart();
          }}
          className={`rounded-full px-3 py-1.5 text-[0.76rem] font-extrabold text-white transition-colors ${
            justAdded ? "bg-green-600" : "bg-primary-500 hover:bg-primary-600"
          }`}
        >
          {justAdded ? "✓ Added" : "+ Add"}
        </button>
      )}
      {expandable && (
        <span
          className={`text-[0.8rem] text-neutral-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      )}
    </div>
  );

  const expandPanel = expandable && expanded && (
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
          disabled={displayPrice == null}
          className={`h-10.5 flex-1 rounded-[10px] text-[0.88rem] font-extrabold text-white transition-colors disabled:cursor-not-allowed disabled:bg-neutral-300 ${
            justAdded ? "bg-green-600" : "bg-primary-500 hover:bg-primary-600"
          }`}
        >
          {justAdded ? "✓ Added" : displayPrice == null ? "Contact for pricing" : "Add to cart"}
        </button>
      </div>

      <Link
        href={`/products/${product.id}`}
        className="mt-2.5 inline-block text-[0.8rem] font-bold text-primary-500"
      >
        View full details →
      </Link>
    </div>
  );

  if (layout === "grid") {
    return (
      <div className="overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white transition-shadow hover:shadow-sm">
        <div
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden text-[3.25rem]"
          style={imageUrl ? undefined : { backgroundImage: gradient }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <span aria-hidden>{icon}</span>
          )}
          <div className="absolute top-2 left-2 rounded-full bg-white/85 backdrop-blur-sm">
            {saveButton}
          </div>
          {product.stockState !== "in" && (
            <span
              className={`absolute top-2 right-2 rounded-full px-2 py-0.75 text-[0.62rem] font-bold shadow-sm ${STOCK_CLASS[product.stockState]}`}
            >
              {stockLabel(product.stockState)}
            </span>
          )}
        </div>
        <div
          className={expandable ? "cursor-pointer px-3.5 py-3" : "px-3.5 py-3"}
          onClick={expandable ? () => setExpanded((v) => !v) : undefined}
        >
          <div className="truncate text-[0.93rem] font-bold text-neutral-900">{product.name}</div>
          {metaLine && <div className="mt-0.25 truncate text-[0.76rem] text-neutral-500">{metaLine}</div>}
          <div className="mt-1.75 flex items-end justify-between gap-2">
            {priceBlock}
            {addOrExpand}
          </div>
        </div>
        {expandPanel}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white">
      <div
        className={`flex items-start gap-3 px-3.5 py-3.5 ${expandable ? "cursor-pointer" : ""}`}
        onClick={expandable ? () => setExpanded((v) => !v) : undefined}
      >
        <div
          className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] text-[1.85rem]"
          style={imageUrl ? undefined : { backgroundImage: gradient }}
        >
          {imageUrl ? (
            <Image src={imageUrl} alt={product.name} fill sizes="48px" className="object-cover" />
          ) : (
            icon
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-[0.93rem] font-bold text-neutral-900">{product.name}</div>
              {metaLine && (
                <div className="mt-0.25 truncate text-[0.76rem] text-neutral-500">{metaLine}</div>
              )}
            </div>
            {saveButton}
          </div>
          <div className="mt-1.75 flex items-end justify-between gap-2">
            {priceBlock}
            {addOrExpand}
          </div>
        </div>
      </div>
      {expandPanel}
    </div>
  );
}

export function ProductCardSkeleton({ layout = "list" }: { layout?: Layout }) {
  if (layout === "grid") {
    return (
      <div className="overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white">
        <div className="aspect-[4/3] animate-pulse bg-neutral-100" />
        <div className="space-y-2 px-3.5 py-3">
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-neutral-100" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-100" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white px-3.5 py-3.5">
      <div className="h-12 w-12 shrink-0 animate-pulse rounded-[10px] bg-neutral-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-neutral-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
        <div className="h-4 w-1/4 animate-pulse rounded bg-neutral-100" />
      </div>
    </div>
  );
}
