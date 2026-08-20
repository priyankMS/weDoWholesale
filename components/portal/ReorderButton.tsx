"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/portal/ToastProvider";
import { useCart } from "@/lib/cart/CartContext";
import { getReorderItems } from "@/lib/api/account";
import { getApiErrorMessage } from "@/lib/api/error";

export function ReorderButton({
  orderNumber,
  className,
}: {
  orderNumber: string;
  className?: string;
}) {
  const router = useRouter();
  const showToast = useToast();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);

  async function handleReorder() {
    setLoading(true);
    try {
      const { items, unavailable } = await getReorderItems(orderNumber);
      for (const item of items) {
        addItem(
          {
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            category: item.category,
            unit: item.unit,
            image: item.image,
            price: item.price,
            supplierName: item.supplierName,
          },
          item.qty,
        );
      }

      if (items.length === 0) {
        showToast("None of these items are available to reorder right now");
      } else if (unavailable.length > 0) {
        showToast(`Loaded into cart — ${unavailable.length} item(s) no longer available`);
        router.push("/cart");
      } else {
        showToast("Order loaded into cart ✓");
        router.push("/cart");
      }
    } catch (err) {
      showToast(getApiErrorMessage(err, "Couldn't reorder — please try again"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" onClick={handleReorder} disabled={loading} className={className}>
      {loading ? "Loading…" : "🔁 Reorder"}
    </Button>
  );
}
