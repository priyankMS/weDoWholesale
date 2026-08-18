"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/portal/ToastProvider";
import { useCart } from "@/lib/cart/CartContext";
import { useSavedProducts } from "@/lib/hooks/useSavedProducts";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { stockLabel } from "@/lib/format";
import { categoryGradient, productIcon } from "@/lib/productVisuals";
import type { ProductSummary } from "@/lib/db/queries/catalogue";

export function ProductDetailClient({
  product,
  shortDesc,
  longDesc,
  sku,
}: {
  product: ProductSummary;
  shortDesc: string | null;
  longDesc: string | null;
  sku: string | null;
}) {
  const showToast = useToast();
  const { addItem } = useCart();
  const { savedIds, toggle } = useSavedProducts();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? null,
  );
  const [qty, setQty] = useState(10);
  const [justAdded, setJustAdded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [checkedUrl, setCheckedUrl] = useState<string | null>(null);

  const saved = savedIds.has(product.id);
  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0] ?? null;
  const price = selectedVariant ? selectedVariant.price : product.minPrice;
  const imageUrl = selectedVariant?.image ?? product.image;
  if (imageUrl !== checkedUrl) {
    setCheckedUrl(imageUrl);
    setImgFailed(false);
  }
  const showImage = !!imageUrl && !imgFailed;

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
    if (!selectedVariant || price == null) return;
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        name:
          selectedVariant.label && selectedVariant.label !== "Standard"
            ? `${product.name} (${selectedVariant.label})`
            : product.name,
        category: product.category,
        unit: product.unit,
        image: imageUrl,
        price,
        supplierName: selectedVariant.supplierName,
      },
      qty,
    );
    showToast(`${product.name} added to cart ✓`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <div className="lg:flex lg:items-start lg:gap-10">
      <div className="mx-4 lg:mx-0 lg:sticky lg:top-24 lg:w-[26rem] lg:shrink-0">
        <div
          className="relative aspect-square overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 shadow-sm"
          style={showImage ? undefined : { backgroundImage: categoryGradient(product.category) }}
        >
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[5rem]">
              {productIcon(product.category)}
            </div>
          )}
          <button
            type="button"
            onClick={() => toggle(product.id)}
            aria-label={saved ? "Remove from saved" : "Save"}
            className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[1.2rem] shadow-sm backdrop-blur-sm transition-colors ${saved ? "text-primary-500" : "text-neutral-300"}`}
          >
            {saved ? "♥" : "♡"}
          </button>
          {product.stockState !== "in" && (
            <span
              className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[0.68rem] font-bold shadow-sm ${
                product.stockState === "low"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {stockLabel(product.stockState)}
            </span>
          )}
        </div>
      </div>

      <div className="mx-4 mt-4 lg:mx-0 lg:mt-0 lg:min-w-0 lg:flex-1">
        <div className="mb-1 text-[0.72rem] font-extrabold tracking-widest text-primary-500 uppercase">
          {product.category}
          {product.type ? ` · ${product.type}` : ""}
        </div>
        <div className="mb-1.5 font-serif text-[1.6rem] font-black text-neutral-900 lg:text-[2rem]">
          {product.name}
        </div>
        {shortDesc && (
          <p className="mb-3 max-w-prose text-[0.86rem] leading-relaxed text-neutral-600">
            {shortDesc}
          </p>
        )}
        <div className="mb-3.5 flex flex-wrap gap-1.5">
          {selectedVariant?.conditionType && (
            <span className="rounded-md bg-green-50 px-2 py-0.75 text-[0.66rem] font-bold text-green-600">
              {selectedVariant.conditionType}
            </span>
          )}
        </div>

        {/* Buy box */}
        <div className="rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4 lg:p-5">
          <div className="mb-1 flex items-baseline gap-1.5">
            <div className="font-serif text-[2rem] font-black text-primary-600">
              {price != null ? `$${price.toFixed(2)}` : "Contact for pricing"}
            </div>
            {price != null && (
              <div className="text-[0.84rem] font-medium text-neutral-400">
                / {product.unit}
                {product.unit === "kg" ? " est." : ""}
              </div>
            )}
          </div>
          {product.unit === "kg" && price != null && (
            <div className="mb-1 text-[0.76rem] text-neutral-400">
              ⚖️ Price is an estimate based on requested weight — actual invoice is based on
              weighed weight at dispatch.
            </div>
          )}

          {product.variants.length > 1 && (
            <div className="mt-3.5">
              <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
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

          {/* Desktop only — mobile uses the sticky bottom bar below instead,
              so this doesn't render twice on small screens. */}
          <div className="mt-4 hidden items-center gap-2.5 lg:flex">
            <QtyStepper value={qty} onChange={setQty} />
            <button
              type="button"
              onClick={addToCart}
              disabled={price == null}
              className={`h-10.5 flex-none rounded-xl px-5 text-[0.88rem] font-extrabold text-white transition-colors disabled:cursor-not-allowed disabled:bg-neutral-300 ${
                justAdded ? "bg-green-600" : "bg-primary-500 hover:bg-primary-600"
              }`}
            >
              {justAdded ? "✓ Added" : price == null ? "Contact for pricing" : "Add to cart →"}
            </button>
          </div>
        </div>

        {specRows.length > 0 && (
          <div className="mt-3.5">
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

        {longDesc && (
          <div className="mt-3.5">
            <div className="mb-2 px-0.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
              Description
            </div>
            <div className="rounded-2xl border-[1.5px] border-neutral-200 bg-white px-4 py-3.5 text-[0.86rem] leading-relaxed text-neutral-700">
              {longDesc}
            </div>
          </div>
        )}

        <div className="mt-3.5">
          <div className="mb-2 px-0.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Halal certification
          </div>
          <div className="flex items-center gap-3.5 rounded-2xl border-[1.5px] border-neutral-200 bg-white px-4 py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-green-200 bg-green-50 text-lg">
              ✓
            </div>
            <div className="flex-1 text-[0.8rem] leading-snug text-neutral-700">
              All WeDoHalal products are sourced from certified halal suppliers.
            </div>
            <Link href="/halal-certs" className="shrink-0 text-[0.82rem] font-bold text-primary-500">
              View →
            </Link>
          </div>
        </div>

        <div className="h-20 lg:hidden" />

        {/* Mobile sticky add-to-cart bar — desktop uses the buy box above instead */}
        <div className="fixed inset-x-0 bottom-16 z-40 flex items-center gap-2.5 border-t-[1.5px] border-neutral-200 bg-white px-4 py-3 lg:hidden">
          <QtyStepper value={qty} onChange={setQty} />
          <button
            type="button"
            onClick={addToCart}
            disabled={price == null}
            className={`h-10.5 flex-1 rounded-xl text-[0.92rem] font-extrabold text-white transition-colors disabled:cursor-not-allowed disabled:bg-neutral-300 ${
              justAdded ? "bg-green-600" : "bg-primary-500 hover:bg-primary-600"
            }`}
          >
            {justAdded ? "✓ Added to cart" : price == null ? "Contact for pricing" : "Add to cart →"}
          </button>
        </div>
      </div>
    </div>
  );
}
