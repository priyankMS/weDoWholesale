"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addAdminOrderItem } from "@/lib/api/adminOrders";
import { getApiErrorMessage } from "@/lib/api/error";
import { ProductVariantPicker, type PickedVariant } from "@/components/admin/ProductVariantPicker";

export function AddOrderItemForm({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [picked, setPicked] = useState<PickedVariant | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!picked) {
      toast.error("Pick a product first");
      return;
    }
    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    setSaving(true);
    try {
      await addAdminOrderItem(orderId, { productId: picked.productId, variantId: picked.variantId, quantity: qty });
      toast.success(`${picked.label} added to the order`);
      setPicked(null);
      setQuantity("1");
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2 border-t border-[#e4e1dc] bg-[#faf9f7] px-4 py-3">
      <div className="min-w-64 flex-1">
        <label className="mb-1 block text-[11px] font-bold tracking-wide text-[#9a9490] uppercase">
          Add item
        </label>
        <ProductVariantPicker onSelect={setPicked} />
        {picked && (
          <div className="mt-1 text-[12px] font-semibold text-[#1e8a4a]">
            {picked.label} {picked.unitPrice != null ? `· $${picked.unitPrice.toFixed(2)}/${picked.unit}` : ""}
          </div>
        )}
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-bold tracking-wide text-[#9a9490] uppercase">
          Qty {picked ? `(${picked.unit})` : ""}
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-24 rounded border border-[#d0ccc6] px-2 py-1.5 text-[13px] outline-none focus:border-[#e05a4a]"
        />
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={saving}
        className="rounded-[5px] bg-[#e05a4a] px-3.5 py-1.5 text-[13px] font-bold text-white hover:bg-[#c04535] disabled:opacity-60"
      >
        {saving ? "Adding…" : "Add to order"}
      </button>
    </div>
  );
}
