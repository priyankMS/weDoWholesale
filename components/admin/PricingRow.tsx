"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateAdminPricing } from "@/lib/api/adminPricing";
import { getApiErrorMessage } from "@/lib/api/error";
import type { AdminPricingRow } from "@/lib/db/queries/adminPricing";

const cellInputClass =
  "w-24 rounded-md border border-neutral-300 bg-white px-2 py-1 text-[0.8rem] outline-none focus:border-red-500";

function marginPercent(dealer: number | null, retail: number | null): number | null {
  if (dealer == null || retail == null || dealer <= 0) return null;
  return ((retail - dealer) / retail) * 100;
}

export function PricingRow({ row }: { row: AdminPricingRow }) {
  const [dealerPrice, setDealerPrice] = useState(row.dealerPrice?.toString() ?? "");
  const [priceIncrement, setPriceIncrement] = useState(row.priceIncrement?.toString() ?? "");
  const [retailPrice, setRetailPrice] = useState(row.retailPrice?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const dealerNum = dealerPrice === "" ? null : Number(dealerPrice);
  const retailNum = retailPrice === "" ? null : Number(retailPrice);
  const margin = marginPercent(dealerNum, retailNum);
  const lowMargin = margin != null && margin < 10;

  async function handleSave() {
    setSaving(true);
    try {
      await updateAdminPricing(row.id, {
        dealerPrice: dealerNum,
        priceIncrement: priceIncrement === "" ? null : Number(priceIncrement),
        retailPrice: retailNum,
      });
      toast.success("Pricing saved");
      setDirty(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className={`border-b border-neutral-100 last:border-0 ${lowMargin ? "bg-red-50/50" : "hover:bg-neutral-50"}`}>
      <td className="px-4 py-2.5 font-mono text-[0.84rem] text-neutral-500">{row.sku || "—"}</td>
      <td className="px-4 py-2.5 font-semibold text-neutral-900">{row.productName}</td>
      <td className="px-4 py-2.5 text-neutral-600">{row.variantLabel}</td>
      <td className="px-4 py-2.5 text-neutral-600">{row.supplierName || "—"}</td>
      <td className="px-4 py-2.5">
        <input
          type="number"
          step="0.01"
          value={dealerPrice}
          onChange={(e) => {
            setDealerPrice(e.target.value);
            setDirty(true);
          }}
          className={cellInputClass}
        />
      </td>
      <td className="px-4 py-2.5">
        <input
          type="number"
          step="0.01"
          value={priceIncrement}
          onChange={(e) => {
            setPriceIncrement(e.target.value);
            setDirty(true);
          }}
          className={cellInputClass}
        />
      </td>
      <td className="px-4 py-2.5">
        <input
          type="number"
          step="0.01"
          value={retailPrice}
          onChange={(e) => {
            setRetailPrice(e.target.value);
            setDirty(true);
          }}
          className={cellInputClass}
        />
      </td>
      <td className={`px-4 py-2.5 font-semibold ${lowMargin ? "text-red-600" : "text-neutral-700"}`}>
        {margin != null ? `${margin.toFixed(1)}%` : "—"}
      </td>
      <td className="px-4 py-2.5 text-right">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-md bg-red-600 px-3 py-1.5 text-[0.84rem] font-bold text-white hover:bg-red-700 disabled:opacity-40"
        >
          {saving ? "…" : "Save"}
        </button>
      </td>
    </tr>
  );
}
