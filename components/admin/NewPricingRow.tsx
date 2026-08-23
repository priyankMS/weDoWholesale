"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAdminPricing } from "@/lib/api/adminPricing";
import { getApiErrorMessage } from "@/lib/api/error";
import type { VariantWithoutPricing } from "@/lib/db/queries/adminPricing";
import type { WdhSupplier } from "@/lib/db/models/WdhSupplier";

const cellInputClass =
  "w-24 rounded-md border border-neutral-300 bg-white px-2 py-1 text-[0.8rem] outline-none focus:border-red-500";

export function NewPricingRow({
  variant,
  suppliers,
}: {
  variant: VariantWithoutPricing;
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
    <tr className="border-b border-neutral-100 bg-amber-50/40 last:border-0">
      <td className="px-4 py-2.5 font-mono text-[0.84rem] text-neutral-500">{variant.sku || "—"}</td>
      <td className="px-4 py-2.5 font-semibold text-neutral-900">{variant.productName}</td>
      <td className="px-4 py-2.5 text-neutral-600">{variant.variantLabel}</td>
      <td className="px-4 py-2.5">
        <select
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-[0.8rem] outline-none focus:border-red-500"
        >
          <option value="">No supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2.5">
        <input
          type="number"
          step="0.01"
          value={dealerPrice}
          onChange={(e) => setDealerPrice(e.target.value)}
          className={cellInputClass}
        />
      </td>
      <td className="px-4 py-2.5">
        <input
          type="number"
          step="0.01"
          value={priceIncrement}
          onChange={(e) => setPriceIncrement(e.target.value)}
          className={cellInputClass}
        />
      </td>
      <td className="px-4 py-2.5">
        <input
          type="number"
          step="0.01"
          value={retailPrice}
          onChange={(e) => setRetailPrice(e.target.value)}
          className={cellInputClass}
        />
      </td>
      <td className="px-4 py-2.5 text-right">
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="rounded-md bg-green-600 px-3 py-1.5 text-[0.84rem] font-bold text-white hover:bg-green-700 disabled:opacity-40"
        >
          {saving ? "…" : "+ Add"}
        </button>
      </td>
    </tr>
  );
}
