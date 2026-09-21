"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductPicker, type PickedProduct } from "@/components/admin/ProductPicker";
import { AddVariantForm } from "@/components/admin/AddVariantForm";
import { getAdminVariantFacets, type AdminVariantFacets } from "@/lib/api/adminVariants";

// Entry point for adding a variant from a context that isn't already
// scoped to one product (the flat /admin/variants list) — picks the
// product first, then reuses the same AddVariantForm the per-product
// surfaces (ProductDetailPanel, /admin/products/[id]) already use.
export function AddVariantModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<PickedProduct | null>(null);
  const [facets, setFacets] = useState<AdminVariantFacets | undefined>(undefined);

  function openModal() {
    setProduct(null);
    setOpen(true);
    getAdminVariantFacets()
      .then(setFacets)
      .catch(() => setFacets(undefined));
  }

  function close() {
    setOpen(false);
    setProduct(null);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={openModal}
        className="rounded-md bg-[#e05a4a] px-3 py-1.5 text-[13px] font-bold text-white hover:bg-[#c04535]"
      >
        + Add Variant
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[199] bg-black/30" onClick={close} aria-hidden />
      <div className="fixed top-1/2 left-1/2 z-[200] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[15px] font-bold text-[#1a1816]">Add Variant</div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="text-[14px] text-[#9a9490] hover:text-[#1a1816]"
          >
            ✕
          </button>
        </div>

        {!product ? (
          <>
            <div className="mb-1.5 text-[12px] font-semibold tracking-wide text-[#9a9490] uppercase">
              Which product?
            </div>
            <ProductPicker onSelect={setProduct} />
          </>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between rounded-md bg-[#f7f5f2] px-2.5 py-1.5 text-[13px]">
              <span className="font-semibold text-[#1a1816]">{product.name}</span>
              <button
                type="button"
                onClick={() => setProduct(null)}
                className="font-bold text-[#e05a4a] hover:underline"
              >
                Change
              </button>
            </div>
            <AddVariantForm
              productId={product.id}
              facets={facets}
              defaultOpen
              onCancel={close}
              onCreated={() => {
                close();
                router.refresh();
              }}
            />
          </>
        )}
      </div>
    </>
  );
}
