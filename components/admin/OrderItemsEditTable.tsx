"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAdminOrderItem } from "@/lib/api/adminOrders";
import { getApiErrorMessage } from "@/lib/api/error";
import { ProductVariantPicker, type PickedVariant } from "@/components/admin/ProductVariantPicker";

export type RevisionSnapshot = {
  productName: string;
  sku: string | null;
  category: string | null;
  conditionType: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
};

export type RevisionRow = {
  orderItemId: number;
  original: RevisionSnapshot | null;
  revised: RevisionSnapshot;
};

// Formats the +/- gap between what the customer originally ordered and
// what's about to ship — e.g. "+2.05 kg" when more went out than ordered,
// "-0.5 kg" when less did — so the admin doesn't have to do the subtraction
// in their head every time they weigh-adjust an item.
function formatDelta(original: RevisionSnapshot | null, quantity: number, unit: string): string | null {
  if (!original) return null;
  const delta = Math.round((quantity - original.quantity) * 100) / 100;
  if (delta === 0) return null;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta} ${unit}`;
}

export function OrderItemsEditTable({ orderId, rows }: { orderId: number; rows: RevisionRow[] }) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<number, string>>(
    Object.fromEntries(rows.map((r) => [r.orderItemId, String(r.revised.quantity)])),
  );
  const [unitPrices, setUnitPrices] = useState<Record<number, string>>(
    Object.fromEntries(rows.map((r) => [r.orderItemId, String(r.revised.unitPrice)])),
  );
  const [substituting, setSubstituting] = useState<number | null>(null);
  const [pendingSub, setPendingSub] = useState<Record<number, PickedVariant | undefined>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  async function handleSave(row: RevisionRow) {
    const quantity = Number(quantities[row.orderItemId]);
    if (Number.isNaN(quantity) || quantity < 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    const unitPriceInput = unitPrices[row.orderItemId];
    const unitPrice = unitPriceInput === "" ? undefined : Number(unitPriceInput);
    if (unitPrice != null && (Number.isNaN(unitPrice) || unitPrice < 0)) {
      toast.error("Enter a valid price");
      return;
    }
    const sub = pendingSub[row.orderItemId];
    setSavingId(row.orderItemId);
    try {
      await updateAdminOrderItem(orderId, row.orderItemId, {
        quantity,
        // Only sent when it differs from what's already live — otherwise a
        // substitution's freshly-priced variant would get silently
        // overwritten by the stale price still sitting in this input.
        ...(unitPrice != null && unitPrice !== row.revised.unitPrice ? { unitPrice } : {}),
        ...(sub ? { productId: sub.productId, variantId: sub.variantId } : {}),
      });
      toast.success(sub ? "Item substituted" : "Item updated");
      setPendingSub((p) => ({ ...p, [row.orderItemId]: undefined }));
      setSubstituting(null);
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  async function handleRemove(row: RevisionRow) {
    setSavingId(row.orderItemId);
    try {
      await updateAdminOrderItem(orderId, row.orderItemId, { quantity: 0 });
      toast.success("Item removed — revised quantity set to 0");
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  if (rows.length === 0) {
    return <div className="px-4 py-6 text-center text-[13px] text-[#9a9490]">No items.</div>;
  }

  return (
    <>
      {/* Stacked cards on mobile — the 6-column table can't fit a narrow
          screen without truncating text, so each row becomes a labeled
          card below sm; the table takes over at sm and up. */}
      <div className="space-y-2.5 p-2.5 sm:hidden">
        {rows.map((row) => {
          const sub = pendingSub[row.orderItemId];
          const displayName = sub?.label ?? row.revised.productName;
          const unit = sub?.unit ?? row.revised.unit;
          const unitPriceInput = unitPrices[row.orderItemId] ?? "";
          const unitPrice = sub?.unitPrice ?? (unitPriceInput === "" ? row.revised.unitPrice : Number(unitPriceInput));
          const quantity = Number(quantities[row.orderItemId] ?? row.revised.quantity);
          const totalPrice =
            !Number.isNaN(quantity) && unitPrice != null ? quantity * unitPrice : row.revised.totalPrice;
          const changed =
            quantities[row.orderItemId] !== String(row.revised.quantity) ||
            (unitPriceInput !== "" && Number(unitPriceInput) !== row.revised.unitPrice) ||
            !!sub;
          const delta = formatDelta(row.original, quantity, unit);
          const isReplaced = !!row.original && row.original.productName !== row.revised.productName;
          return (
            <div key={row.orderItemId} className="rounded-md border border-[#e4e1dc] bg-white p-3">
              {row.original && (
                <div className="mb-2 border-b border-dashed border-[#e4e1dc] pb-2 text-[12px] text-[#9a9490]">
                  <div className="mb-0.5 text-[10px] font-bold tracking-wide uppercase">Original order</div>
                  <div className="font-semibold text-[#5a5450]">{row.original.productName}</div>
                  <div>
                    {row.original.category ?? "—"} · {row.original.conditionType ?? "—"} ·{" "}
                    {row.original.sku ?? "—"}
                  </div>
                  <div>
                    {row.original.quantity} {row.original.unit} @ ${row.original.unitPrice.toFixed(2)} = $
                    {row.original.totalPrice.toFixed(2)}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-[#9a9490] uppercase">
                {row.original ? "Sending to customer" : "Added this revision"}
                {isReplaced && (
                  <span className="rounded-full bg-[#fdf2f1] px-1.5 py-0.5 text-[10px] font-bold text-[#c04535]">
                    REPLACED
                  </span>
                )}
              </div>
              <div className="font-semibold text-[#1a1816]">{displayName}</div>
              <div className="text-[12px] text-[#9a9490]">
                {row.revised.category ?? "—"} · {row.revised.conditionType ?? "—"} · {row.revised.sku ?? "—"}
              </div>
              {substituting === row.orderItemId ? (
                <div className="mt-1.5">
                  <ProductVariantPicker
                    onSelect={(picked) => setPendingSub((p) => ({ ...p, [row.orderItemId]: picked }))}
                  />
                  {sub && (
                    <div className="mt-1 text-[11px] font-semibold text-[#1e8a4a]">Selected: {sub.label}</div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSubstituting(row.orderItemId)}
                  className="mt-1 text-[12px] font-bold text-[#e05a4a] hover:underline"
                >
                  Item not available — substitute product
                </button>
              )}

              <div className="mt-2.5 grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-0.5 block text-[10px] font-semibold text-[#9a9490] uppercase">
                    Qty ({unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quantities[row.orderItemId] ?? ""}
                    onChange={(e) => setQuantities((q) => ({ ...q, [row.orderItemId]: e.target.value }))}
                    className="w-full rounded border border-[#d0ccc6] px-1.5 py-1 text-[13px] outline-none focus:border-[#e05a4a]"
                  />
                  {delta && (
                    <div className={`mt-0.5 text-[11px] font-bold ${delta.startsWith("+") ? "text-[#1e8a4a]" : "text-[#c04535]"}`}>
                      {delta}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-semibold text-[#9a9490] uppercase">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={row.revised.unitPrice.toFixed(2)}
                    value={unitPriceInput}
                    onChange={(e) => setUnitPrices((p) => ({ ...p, [row.orderItemId]: e.target.value }))}
                    className="w-full rounded border border-[#d0ccc6] px-1.5 py-1 text-[13px] outline-none focus:border-[#e05a4a]"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-semibold text-[#9a9490] uppercase">Total</label>
                  <div className="py-1 text-[13px] font-semibold text-[#1a1816]">${totalPrice.toFixed(2)}</div>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-3">
                {changed && (
                  <button
                    type="button"
                    onClick={() => handleSave(row)}
                    disabled={savingId === row.orderItemId}
                    className="rounded-[5px] bg-[#e05a4a] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#c04535] disabled:opacity-60"
                  >
                    {savingId === row.orderItemId ? "Saving…" : "Save"}
                  </button>
                )}
                {row.revised.quantity > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(row)}
                    disabled={savingId === row.orderItemId}
                    className="text-[12px] font-bold text-[#9a9490] hover:text-[#c04535]"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table at sm and up. */}
      <table className="hidden w-full text-left text-[13px] sm:table">
        <thead>
          <tr className="bg-[#f0ede9]">
            {["What the customer ordered", "What you're sending", "Qty", "Unit Price", "Total", ""].map((h) => (
              <th key={h} className="px-2.5 py-1.5 text-[12px] font-semibold tracking-wide text-[#5a5450] uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const sub = pendingSub[row.orderItemId];
            const displayName = sub?.label ?? row.revised.productName;
            const unit = sub?.unit ?? row.revised.unit;
            const unitPriceInput = unitPrices[row.orderItemId] ?? "";
            const unitPrice =
              sub?.unitPrice ?? (unitPriceInput === "" ? row.revised.unitPrice : Number(unitPriceInput));
            const quantity = Number(quantities[row.orderItemId] ?? row.revised.quantity);
            const totalPrice =
              !Number.isNaN(quantity) && unitPrice != null ? quantity * unitPrice : row.revised.totalPrice;
            const changed =
              quantities[row.orderItemId] !== String(row.revised.quantity) ||
              (unitPriceInput !== "" && Number(unitPriceInput) !== row.revised.unitPrice) ||
              !!sub;
            const delta = formatDelta(row.original, quantity, unit);
            const isReplaced = !!row.original && row.original.productName !== row.revised.productName;
            return (
              <tr
                key={row.orderItemId}
                className={`border-b border-[#e4e1dc] last:border-0 ${i % 2 === 1 ? "bg-[#faf9f7]" : "bg-white"}`}
              >
                <td className="px-2.5 py-1.5 align-top text-[#9a9490]">
                  {row.original ? (
                    <>
                      <div className="font-semibold text-[#5a5450]">{row.original.productName}</div>
                      <div className="text-[11px]">
                        {row.original.category ?? "—"} · {row.original.conditionType ?? "—"} ·{" "}
                        {row.original.sku ?? "—"}
                      </div>
                      <div className="text-[11px]">
                        {row.original.quantity} {row.original.unit} @ ${row.original.unitPrice.toFixed(2)} = $
                        {row.original.totalPrice.toFixed(2)}
                      </div>
                    </>
                  ) : (
                    <span className="italic">Not part of the original order</span>
                  )}
                </td>
                <td className="px-2.5 py-1.5 align-top">
                  <div className="flex items-center gap-1.5">
                    <div className="font-semibold text-[#1a1816]">{displayName}</div>
                    {isReplaced && (
                      <span className="rounded-full bg-[#fdf2f1] px-1.5 py-0.5 text-[10px] font-bold text-[#c04535]">
                        REPLACED
                      </span>
                    )}
                    {!row.original && (
                      <span className="rounded-full bg-[#eef7ee] px-1.5 py-0.5 text-[10px] font-bold text-[#1e8a4a]">
                        ADDED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#9a9490]">
                    {row.revised.category ?? "—"} · {row.revised.conditionType ?? "—"} · {row.revised.sku ?? "—"}
                  </div>
                  {substituting === row.orderItemId ? (
                    <div className="mt-1.5 w-64">
                      <ProductVariantPicker
                        onSelect={(picked) => setPendingSub((p) => ({ ...p, [row.orderItemId]: picked }))}
                      />
                      {sub && (
                        <div className="mt-1 text-[11px] font-semibold text-[#1e8a4a]">Selected: {sub.label}</div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSubstituting(row.orderItemId)}
                      className="mt-1 text-[11px] font-bold text-[#e05a4a] hover:underline"
                    >
                      Item not available — substitute product
                    </button>
                  )}
                </td>
                <td className="px-2.5 py-1.5 align-top">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={quantities[row.orderItemId] ?? ""}
                      onChange={(e) => setQuantities((q) => ({ ...q, [row.orderItemId]: e.target.value }))}
                      className="w-16 rounded border border-[#d0ccc6] px-1.5 py-1 text-[13px] outline-none focus:border-[#e05a4a]"
                    />
                    <span className="text-[11px] text-[#9a9490]">{unit}</span>
                  </div>
                  {delta && (
                    <div className={`mt-0.5 text-[11px] font-bold ${delta.startsWith("+") ? "text-[#1e8a4a]" : "text-[#c04535]"}`}>
                      {delta}
                    </div>
                  )}
                </td>
                <td className="px-2.5 py-1.5 align-top">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={row.revised.unitPrice.toFixed(2)}
                    value={unitPriceInput}
                    onChange={(e) => setUnitPrices((p) => ({ ...p, [row.orderItemId]: e.target.value }))}
                    className="w-20 rounded border border-[#d0ccc6] px-1.5 py-1 text-[13px] text-[#5a5450] outline-none focus:border-[#e05a4a]"
                  />
                </td>
                <td className="px-2.5 py-1.5 align-top font-semibold text-[#1a1816]">${totalPrice.toFixed(2)}</td>
                <td className="px-2.5 py-1.5 align-top text-right">
                  <div className="flex flex-col items-end gap-1">
                    {changed && (
                      <button
                        type="button"
                        onClick={() => handleSave(row)}
                        disabled={savingId === row.orderItemId}
                        className="rounded-[5px] bg-[#e05a4a] px-2.5 py-1 text-[12px] font-bold text-white hover:bg-[#c04535] disabled:opacity-60"
                      >
                        {savingId === row.orderItemId ? "Saving…" : "Save"}
                      </button>
                    )}
                    {row.revised.quantity > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemove(row)}
                        disabled={savingId === row.orderItemId}
                        className="text-[11px] font-bold text-[#9a9490] hover:text-[#c04535]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
