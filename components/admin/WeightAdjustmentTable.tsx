"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { recordWeightAdjustment } from "@/lib/api/adminOrders";
import { getApiErrorMessage } from "@/lib/api/error";

export type WeightAdjustmentItem = {
  id: number;
  productName: string | null;
  sku: string | null;
  /** Originally ordered quantity — display-only, never changes. */
  quantity: number;
  /** Latest settled/actual quantity (falls back to `quantity` if never adjusted) — the editable baseline. */
  actualQuantity: number;
  unitPrice: number;
  /** Original ordered total — display-only, never changes. */
  totalPrice: number;
};

export function WeightAdjustmentTable({
  orderId,
  items,
}: {
  orderId: number;
  items: WeightAdjustmentItem[];
}) {
  const router = useRouter();
  const [actuals, setActuals] = useState<Record<number, string>>(
    Object.fromEntries(items.map((i) => [i.id, String(i.actualQuantity)])),
  );
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  async function handleSave(item: WeightAdjustmentItem) {
    const actualQuantity = Number(actuals[item.id]);
    if (Number.isNaN(actualQuantity) || actualQuantity < 0) {
      toast.error("Enter a valid weight");
      return;
    }
    const overrideRaw = overrides[item.id]?.trim();
    let manualAmount: number | null = null;
    if (overrideRaw) {
      manualAmount = Number(overrideRaw);
      if (Number.isNaN(manualAmount)) {
        toast.error("Enter a valid override amount");
        return;
      }
    }
    setSavingId(item.id);
    try {
      const { adjustmentAmount } = await recordWeightAdjustment(orderId, {
        orderItemId: item.id,
        actualQuantity,
        note: notes[item.id]?.trim() || null,
        manualAmount,
      });
      if (Math.abs(adjustmentAmount) < 0.005) {
        toast.success("Recorded — no change to invoice");
      } else {
        toast.success(
          adjustmentAmount > 0
            ? `Recorded — customer owes $${adjustmentAmount.toFixed(2)} more`
            : `Recorded — $${Math.abs(adjustmentAmount).toFixed(2)} refund owed`,
        );
      }
      setNotes((n) => ({ ...n, [item.id]: "" }));
      setOverrides((o) => ({ ...o, [item.id]: "" }));
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <table className="w-full text-left text-[14px]">
      <thead>
        <tr className="bg-[#f0ede9]">
          {["Product", "SKU", "Ordered", "Unit Price", "Ordered Total", "Actual (kg)", "Adjustment"].map((h) => (
            <th key={h} className="px-2.5 py-1.5 text-[13px] font-semibold tracking-wide text-[#5a5450] uppercase">
              {h}
            </th>
          ))}
          <th className="px-2.5 py-1.5" />
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          const actualQuantity = Number(actuals[item.id]);
          const autoAdjustment =
            !Number.isNaN(actualQuantity) && item.unitPrice
              ? (actualQuantity - item.actualQuantity) * item.unitPrice
              : 0;
          const overrideRaw = overrides[item.id]?.trim();
          const hasOverride = !!overrideRaw && !Number.isNaN(Number(overrideRaw));
          const adjustment = hasOverride ? Number(overrideRaw) : autoAdjustment;
          const weightChanged = actuals[item.id] !== String(item.actualQuantity);
          const changed = weightChanged || hasOverride;
          return (
            <tr
              key={item.id}
              className={`border-b border-[#e4e1dc] last:border-0 ${i % 2 === 1 ? "bg-[#faf9f7]" : "bg-white"}`}
            >
              <td className="px-2.5 py-1.5 font-semibold text-[#1a1816]">{item.productName}</td>
              <td className="px-2.5 py-1.5 font-[family-name:var(--font-plex-mono)] text-[13px] text-[#9a9490]">
                {item.sku || "—"}
              </td>
              <td className="px-2.5 py-1.5 text-[#5a5450]">{item.quantity}</td>
              <td className="px-2.5 py-1.5 text-[#5a5450]">${item.unitPrice.toFixed(2)}</td>
              <td className="px-2.5 py-1.5 font-semibold text-[#1a1816]">${item.totalPrice.toFixed(2)}</td>
              <td className="px-2.5 py-1.5">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={actuals[item.id] ?? ""}
                  onChange={(e) => setActuals((a) => ({ ...a, [item.id]: e.target.value }))}
                  className="w-20 rounded border border-[#d0ccc6] px-1.5 py-1 text-[14px] outline-none focus:border-[#e05a4a]"
                />
              </td>
              <td className="px-2.5 py-1.5">
                {changed && !Number.isNaN(actualQuantity) ? (
                  <div className="flex flex-col">
                    <span
                      className={`font-bold ${adjustment > 0 ? "text-[#c48a00]" : adjustment < 0 ? "text-[#1e8a4a]" : "text-[#9a9490]"}`}
                    >
                      {adjustment > 0 ? "+" : ""}${adjustment.toFixed(2)}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={`Override (auto ${autoAdjustment > 0 ? "+" : ""}$${autoAdjustment.toFixed(2)})`}
                      value={overrides[item.id] ?? ""}
                      onChange={(e) => setOverrides((o) => ({ ...o, [item.id]: e.target.value }))}
                      className="mt-1 w-40 rounded border border-[#d0ccc6] px-1.5 py-1 text-[12px] outline-none focus:border-[#e05a4a]"
                    />
                  </div>
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Manual $ adjustment"
                    value={overrides[item.id] ?? ""}
                    onChange={(e) => setOverrides((o) => ({ ...o, [item.id]: e.target.value }))}
                    className="w-40 rounded border border-[#d0ccc6] px-1.5 py-1 text-[12px] text-[#9a9490] outline-none focus:border-[#e05a4a] focus:text-[#1a1816]"
                  />
                )}
              </td>
              <td className="px-2.5 py-1.5 text-right">
                {changed && (
                  <div className="flex flex-col items-end gap-1.5">
                    <input
                      type="text"
                      placeholder="Note (optional)"
                      value={notes[item.id] ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))}
                      className="w-36 rounded border border-[#d0ccc6] px-1.5 py-1 text-[13px] outline-none focus:border-[#e05a4a]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSave(item)}
                      disabled={savingId === item.id}
                      className="rounded-[5px] bg-[#e05a4a] px-2.5 py-1 text-[13px] font-bold text-white hover:bg-[#c04535] disabled:opacity-60"
                    >
                      {savingId === item.id ? "Saving…" : "Save & notify"}
                    </button>
                  </div>
                )}
              </td>
            </tr>
          );
        })}
        {items.length === 0 && (
          <tr>
            <td colSpan={8} className="px-4 py-6 text-center text-[#9a9490]">
              No items.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
