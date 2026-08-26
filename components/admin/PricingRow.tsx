"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateAdminPricing } from "@/lib/api/adminPricing";
import { getApiErrorMessage } from "@/lib/api/error";
import { AdminBadge } from "@/components/admin/AdminBadge";
import type { AdminPricingRow } from "@/lib/db/queries/adminPricing";

const cellInputClass =
  "w-24 rounded border border-[#d0ccc6] bg-white px-1.5 py-1 text-right font-[family-name:var(--font-plex-mono)] text-[14px] text-[#1a1816] outline-none focus:border-[#e05a4a]";

function marginPercent(dealer: number | null, retail: number | null): number | null {
  if (dealer == null || retail == null || dealer <= 0) return null;
  return ((retail - dealer) / retail) * 100;
}

export function PricingRow({ row, index }: { row: AdminPricingRow; index: number }) {
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
    <tr
      className={`border-b border-[#e4e1dc] last:border-0 hover:bg-[#fff5f4] ${
        lowMargin ? "bg-[#fde8e8]" : index % 2 === 1 ? "bg-[#faf9f7]" : "bg-white"
      }`}
    >
      <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] text-[14px] text-[#5a5450]">
        {row.sku || "—"}
      </td>
      <td className="px-2.5 py-1.5 font-semibold text-[#1a1816]">{row.productName}</td>
      <td className="px-2.5 py-1.5 text-[#5a5450]">{row.variantLabel}</td>
      <td className="px-2.5 py-1.5">
        {row.supplierName ? (
          <AdminBadge tone="blue" mono>
            {row.supplierName.split(" ")[0]}
          </AdminBadge>
        ) : (
          "—"
        )}
      </td>
      <td className="px-2.5 py-1.5">
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
      <td className="px-2.5 py-1.5">
        <input
          type="number"
          step="0.01"
          value={priceIncrement}
          onChange={(e) => {
            setPriceIncrement(e.target.value);
            setDirty(true);
          }}
          className={`${cellInputClass} border-[#f5c4be] bg-[#fff8e0] text-[#c48a00] focus:border-[#c48a00]`}
        />
      </td>
      <td className="px-2.5 py-1.5">
        <input
          type="number"
          step="0.01"
          value={retailPrice}
          onChange={(e) => {
            setRetailPrice(e.target.value);
            setDirty(true);
          }}
          className={`${cellInputClass} font-bold text-[#c04535]`}
        />
      </td>
      <td className="px-2.5 py-1.5">
        <span
          className={`font-[family-name:var(--font-plex-mono)] text-[13px] font-bold ${
            lowMargin ? "text-[#cc2222]" : "text-[#5a5450]"
          }`}
        >
          {margin != null ? `${margin.toFixed(1)}%` : "—"}
        </span>
      </td>
      <td className="px-2.5 py-1.5 text-right">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded p-1 text-[15px] hover:bg-[#fdf2f1] disabled:opacity-40"
          aria-label="Save"
        >
          {saving ? "…" : "💾"}
        </button>
      </td>
    </tr>
  );
}
