"use client";

import { useState } from "react";
import { useToast } from "@/components/portal/ToastProvider";
import { useCart } from "@/lib/cart/CartContext";
import type { ProductSummary } from "@/lib/db/queries/catalogue";

export function LowStockAddButton({ product }: { product: ProductSummary }) {
  const showToast = useToast();
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const variant = product.variants.find((v) => v.price != null) ?? product.variants[0] ?? null;
  const price = variant?.price ?? product.minPrice;

  if (!variant || price == null) return null;

  function addToCart() {
    if (!variant || price == null) return;
    addItem(
      {
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        category: product.category,
        unit: product.unit,
        image: variant.image ?? product.image,
        price,
        supplierName: variant.supplierName,
      },
      10,
    );
    showToast(`${product.name} added to cart ✓`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={addToCart}
      className={`ml-auto shrink-0 rounded-[8px] px-3 py-1.5 text-[0.76rem] font-extrabold text-white transition-colors ${
        justAdded ? "bg-green-600" : "bg-primary-500 hover:bg-primary-600"
      }`}
    >
      {justAdded ? "✓ Added" : "Add"}
    </button>
  );
}
