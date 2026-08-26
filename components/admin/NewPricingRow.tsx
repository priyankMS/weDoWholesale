"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAdminPricing } from "@/lib/api/adminPricing";
import { getApiErrorMessage } from "@/lib/api/error";
import type { VariantWithoutPricing } from "@/lib/db/queries/adminPricing";
import type { WdhSupplier } from "@/lib/db/models/WdhSupplier";

const cellInputClass =
  "w-24 rounded border border-[#d0ccc6] bg-white px-1.5 py-1 text-right font-[family-name:var(--font-plex-mono)] text-[14px] text-[#1a1816] outline-none focus:border-[#e05a4a]";

export function NewPricingRow({
  variant,
  index,
  suppliers,
}: {
  variant: VariantWithoutPricing;
  index: number;
  suppliers: Pick<WdhSupplier, "id" | "name">[];
}) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [dealerPrice, setDealerPrice] = useState("");
  const [priceIncrement, setPriceIncrement] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState(false);

  if (added) return null;

  async function handleAdd() {
    setSaving(true);
    try {
      await createAdminPricing({
        variantId: variant.variantId,
        supplierId: supplierId ? Number(supplierId) : null,
        dealerPrice: dealerPrice === "" ? null : Number(dealerPrice),
        priceIncrement: priceIncrement === "" ? null : Number(priceIncrement),
        retailPrice: retailPrice === "" ? null : Number(retailPrice),
      });
      toast.success("Pricing added");
      setAdded(true);
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className={`border-b border-[#e4e1dc] last:border-0 hover:bg-[#fff5f4] ${index % 2 === 1 ? "bg-[#faf9f7]" : "bg-white"}`}>
      <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] text-[14px] text-[#5a5450]">
        {variant.sku || "—"}
      </td>
      <td className="px-2.5 py-1.5 font-semibold text-[#1a1816]">{variant.productName}</td>
      <td className="px-2.5 py-1.5 text-[#5a5450]">{variant.variantLabel}</td>
      <td className="px-2.5 py-1.5">
        <select
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="rounded-md border border-[#d0ccc6] bg-white px-2 py-1 text-[13px] text-[#1a1816] outline-none focus:border-[#e05a4a]"
        >
          <option value="">No supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2.5 py-1.5">
        <input type="number" step="0.01" value={dealerPrice} onChange={(e) => setDealerPrice(e.target.value)} className={cellInputClass} />
      </td>
      <td className="px-2.5 py-1.5">
        <input
          type="number"
          step="0.01"
          value={priceIncrement}
          onChange={(e) => setPriceIncrement(e.target.value)}
          className={`${cellInputClass} border-[#f5c4be] bg-[#fff8e0] text-[#c48a00] focus:border-[#c48a00]`}
        />
      </td>
      <td className="px-2.5 py-1.5">
        <input
          type="number"
          step="0.01"
          value={retailPrice}
          onChange={(e) => setRetailPrice(e.target.value)}
          className={`${cellInputClass} font-bold text-[#c04535]`}
        />
      </td>
      <td className="px-2.5 py-1.5 text-right">
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="rounded-[5px] bg-[#e05a4a] px-2.5 py-1 text-[13px] font-semibold text-white hover:bg-[#c04535] disabled:opacity-50"
        >
          {saving ? "…" : "+ Add"}
        </button>
      </td>
    </tr>
  );
}
