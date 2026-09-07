"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/portal/ToastProvider";
import { useCart } from "@/lib/cart/CartContext";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { stockLabel, variantLabel } from "@/lib/format";
import { categoryGradient, productIcon } from "@/lib/productVisuals";
import { activeVariantDimensions, resolveDimensionSelection, type VariantDimensionKey } from "@/lib/variantDimensions";
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
  const { addItem } = useCart();
  const [expanded, setExpanded] = useState(false);
  const [qty, setQty] = useState(10);
  const [justAdded, setJustAdded] = useState(false);

  // Same per-attribute picker as the product detail page's buy box (and the
  // client's reference design) — Condition / Cut Style / Bone / Skin / Fat /
  // Origin each as their own button group, rather than one flat button per
  // full SKU label, so the price updates as the buyer narrows down their
  // exact combination instead of having to recognize it in a wall of text.
  const activeDimensions = activeVariantDimensions(product.variants);

  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const first = product.variants[0];
    const init: Record<string, string> = {};
    if (first) {
      for (const d of activeDimensions) {
        const val = first[d.key];
        if (val) init[d.key] = val;
      }
    }
    return init;
  });
  const candidates = product.variants.filter((v) =>
    activeDimensions.every((d) => {
      const sel = selections[d.key];
      return !sel || v[d.key] === sel;
    }),
  );
  // When the dimension buttons above don't pin down a single SKU (leftover
  // near-duplicate rows from the catalog import — same visible attributes,
  // different SKU/supplier), just take the first match rather than surfacing
  // a raw "Choose option" list of near-identical buttons to the buyer.
  const selectedVariant = candidates[0] ?? product.variants[0] ?? null;

  function selectDimension(key: VariantDimensionKey, value: string) {
    setSelections((prev) => resolveDimensionSelection(product.variants, activeDimensions, prev, key, value));
  }

  const displayPrice = selectedVariant ? selectedVariant.price : product.minPrice;
  const meta = selectedVariant ? variantLabel(selectedVariant) : null;
  const metaLine = meta && meta !== "Standard" ? meta : product.type;
  const isWeighed = product.unit === "kg";
  const gradient = categoryGradient(product.category);
  const icon = productIcon(product.category);
  const imageUrl = selectedVariant?.image ?? product.image;

  // The pricing sheet's image URLs aren't all live (a handful 404 —
  // mismatched/renamed assets in the client's own library) — fall back to
  // the category tile instead of a broken-image glyph. Reset during render
  // (React's documented pattern for state keyed to a changing prop/value)
  // rather than in an effect, so switching cuts in the variant picker
  // re-attempts the new image without an extra render round-trip.
  const [imgFailed, setImgFailed] = useState(false);
  const [checkedUrl, setCheckedUrl] = useState(imageUrl);
  if (imageUrl !== checkedUrl) {
    setCheckedUrl(imageUrl);
    setImgFailed(false);
  }
  const showImage = !!imageUrl && !imgFailed;

  function addToCart() {
    if (!selectedVariant || displayPrice == null) return;
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        name: metaLine ? `${product.name} (${metaLine})` : product.name,
        category: product.category,
        unit: product.unit,
        image: imageUrl,
        price: displayPrice,
        supplierName: selectedVariant.supplierName,
      },
      qty,
    );
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
      className={`flex h-7 w-7 shrink-0 items-center justify-center text-[1.1rem] transition-colors ${saved ? "text-primary-500" : "text-neutral-300"}`}
    >
      {saved ? "♥" : "♡"}
    </button>
  );

  // Round white badge, only used to host the save button over the photo
  // tile (grid layout) — the list layout's heart sits inline in the text
  // column instead, no badge needed there.
  const saveBadge = (
    <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm">
      {saveButton}
    </div>
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
      {activeDimensions.map((d) => (
        <div key={d.key} className="mb-3">
          <div className="mb-2 text-[0.66rem] font-extrabold tracking-wide text-neutral-400 uppercase">
            {d.label}
          </div>
          <div className="flex flex-wrap gap-1.75">
            {d.values.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => selectDimension(d.key, value)}
                className={`rounded-full border-[1.5px] px-3 py-1.5 text-[0.78rem] font-semibold ${
                  selections[d.key] === value
                    ? "border-primary-500 bg-primary-500 text-white"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2.5">
        <QtyStepper value={qty} onChange={setQty} />
        <button
          type="button"
          onClick={addToCart}
          disabled={displayPrice == null}
          className={`h-10.5 flex-1 rounded-[10px] text-[0.88rem] font-extrabold text-white transition-colors disabled:cursor-not-allowed disabled:bg-neutral-300 xl:max-w-52 ${
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
        <Link
          href={`/products/${product.id}`}
          className="relative flex aspect-[4/3] items-center justify-center overflow-hidden"
          style={showImage ? undefined : { backgroundImage: gradient }}
        >
          {showImage ? (
            // Pre-optimized CDN webp from images.wedohalal.com; next/image's
            // optimizer 400s on this Next 16.3 Turbopack build even with a
            // matching remotePattern.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span aria-hidden className="text-[3.25rem]">
              {icon}
            </span>
          )}
          {product.stockState !== "in" && (
            <span
              className={`absolute top-2 left-2 rounded-full px-2 py-0.75 text-[0.62rem] font-bold shadow-sm ${STOCK_CLASS[product.stockState]}`}
            >
              {stockLabel(product.stockState)}
            </span>
          )}
          {saveBadge}
        </Link>
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
        <Link
          href={`/products/${product.id}`}
          onClick={(e) => e.stopPropagation()}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px]"
          style={showImage ? undefined : { backgroundImage: gradient }}
        >
          {showImage ? (
            // See the grid-layout tile above for why this is a plain <img>.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className="text-[1.85rem]">{icon}</span>
          )}
        </Link>
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
