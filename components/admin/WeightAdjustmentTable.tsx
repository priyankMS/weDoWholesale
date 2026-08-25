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
  quantity: number;
  unitPrice: number;
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
    Object.fromEntries(items.map((i) => [i.id, String(i.quantity)])),
  );
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  async function handleSave(item: WeightAdjustmentItem) {
    const actualQuantity = Number(actuals[item.id]);
    if (Number.isNaN(actualQuantity) || actualQuantity < 0) {
      toast.error("Enter a valid weight");
      return;
    }
    setSavingId(item.id);
    try {
      const { adjustmentAmount } = await recordWeightAdjustment(orderId, {
        orderItemId: item.id,
        actualQuantity,
        note: notes[item.id]?.trim() || null,
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
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <table className="w-full text-left text-[0.9rem]">
      <thead>
        <tr className="border-b border-neutral-100 text-[0.78rem] font-bold tracking-wide text-neutral-400 uppercase">
          <th className="px-4 py-2">Product</th>
          <th className="px-4 py-2">SKU</th>
          <th className="px-4 py-2">Ordered</th>
          <th className="px-4 py-2">Unit Price</th>
          <th className="px-4 py-2">Ordered Total</th>
          <th className="px-4 py-2">Actual (kg)</th>
          <th className="px-4 py-2">Adjustment</th>
          <th className="px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const actualQuantity = Number(actuals[item.id]);
          const adjustment =
            !Number.isNaN(actualQuantity) && item.unitPrice
              ? (actualQuantity - item.quantity) * item.unitPrice
              : 0;
          const changed = actuals[item.id] !== String(item.quantity);
          return (
            <tr key={item.id} className="border-b border-neutral-100 last:border-0">
              <td className="px-4 py-2.5 font-semibold text-neutral-900">{item.productName}</td>
              <td className="px-4 py-2.5 font-mono text-[0.84rem] text-neutral-500">
                {item.sku || "—"}
              </td>
              <td className="px-4 py-2.5 text-neutral-600">{item.quantity}</td>
              <td className="px-4 py-2.5 text-neutral-600">${item.unitPrice.toFixed(2)}</td>
              <td className="px-4 py-2.5 font-semibold text-neutral-900">
                ${item.totalPrice.toFixed(2)}
              </td>
              <td className="px-4 py-2.5">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={actuals[item.id] ?? ""}
                  onChange={(e) => setActuals((a) => ({ ...a, [item.id]: e.target.value }))}
                  className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-[0.86rem] outline-none focus:border-red-500"
                />
              </td>
              <td className="px-4 py-2.5">
                {changed && !Number.isNaN(actualQuantity) ? (
                  <span
                    className={`font-bold ${adjustment > 0 ? "text-amber-600" : adjustment < 0 ? "text-green-600" : "text-neutral-400"}`}
                  >
                    {adjustment > 0 ? "+" : ""}
                    ${adjustment.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-neutral-300">—</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-right">
                {changed && (
                  <div className="flex flex-col items-end gap-1.5">
                    <input
                      type="text"
                      placeholder="Note (optional)"
                      value={notes[item.id] ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))}
                      className="w-36 rounded-md border border-neutral-300 px-2 py-1 text-[0.78rem] outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSave(item)}
                      disabled={savingId === item.id}
                      className="rounded-md bg-red-600 px-3 py-1 text-[0.78rem] font-bold text-white hover:bg-red-700 disabled:opacity-60"
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
            <td colSpan={8} className="px-4 py-6 text-center text-neutral-400">
              No items.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
