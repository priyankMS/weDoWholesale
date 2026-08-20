"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/lib/api/error";
import { lookupSupportOrder, type SupportOrderLookupResult } from "@/lib/api/support";

// Screen 30's order lookup card.
export function OrderLookupCard() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<SupportOrderLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLookup() {
    if (!value.trim()) {
      setResult(null);
      setError("Please enter an order number.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const found = await lookupSupportOrder(value.trim());
      setResult(found);
    } catch (err) {
      setResult(null);
      setError(getApiErrorMessage(err, "Order not found. Check the order number and try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4.5">
      <div className="mb-2.5 text-[0.72rem] font-extrabold tracking-wide text-neutral-400 uppercase">
        Find an order for support
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          placeholder="#WDH-0000"
          className="flex-1 rounded-[10px] border-[1.5px] border-neutral-200 px-3.5 py-2.75 text-[0.9rem] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-500"
        />
        <button
          type="button"
          onClick={handleLookup}
          disabled={loading}
          className="shrink-0 rounded-[10px] bg-primary-500 px-4.5 py-2.75 text-[0.88rem] font-extrabold text-white hover:bg-primary-600 disabled:opacity-60"
        >
          {loading ? "…" : "Find →"}
        </button>
      </div>
      {error && (
        <div className="mt-2.5 rounded-[10px] border border-primary-200 bg-primary-50 px-3 py-2.5 text-[0.8rem] font-semibold text-primary-600">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-2.5 rounded-[10px] border border-green-200 bg-green-50 px-3 py-2.5 text-[0.8rem] font-semibold text-green-600">
          ✓ <strong>#{result.orderNumber}</strong> — {result.statusLabel} · {result.createdAt} ·{" "}
          {result.totalKg} kg · {result.finalAmount}
        </div>
      )}
    </div>
  );
}
