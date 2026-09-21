"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAdminVariant } from "@/lib/api/adminVariants";
import { getApiErrorMessage } from "@/lib/api/error";

const inputClass =
  "w-full rounded-md border border-[#d0ccc6] bg-white px-2.5 py-1.5 text-[14px] text-[#1a1816] outline-none focus:border-[#e05a4a]";
const selectClass = `${inputClass} cursor-pointer bg-white`;
const fieldLabelClass = "mb-0.5 block text-[11px] font-semibold text-[#9a9490] uppercase";

type Draft = {
  sku: string;
  conditionType: string;
  cutType: string;
  boneType: string;
  skinType: string;
  unit: string;
  stockStatus: "in" | "low" | "out";
  basePrice: string;
};

const EMPTY_DRAFT: Draft = {
  sku: "",
  conditionType: "",
  cutType: "",
  boneType: "",
  skinType: "",
  unit: "kg",
  stockStatus: "in",
  basePrice: "",
};

export type VariantAttributeFacets = {
  conditions: string[];
  cutTypes: string[];
  bones: string[];
  skins: string[];
};

const NEW_VALUE = "__new__";

// A <select> of existing catalogue values (native browser type-to-search
// already covers "search"), with a "+ New value…" escape hatch that swaps
// to a plain text input — so picking a value already used elsewhere stays
// a couple of clicks, but a genuinely new one (e.g. a cut style this
// product hasn't had before) is never blocked. Falls back to a plain text
// input outright when no options list is available at all (see `facets`
// on AddVariantForm below — not every caller has it to hand).
function FacetField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: string[];
  placeholder?: string;
}) {
  const [customMode, setCustomMode] = useState(() => !!value && !!options && !options.includes(value));

  if (!options || options.length === 0 || customMode) {
    return (
      <div>
        <label className={fieldLabelClass}>{label}</label>
        <div className="flex gap-1">
          <input className={inputClass} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
          {options && options.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setCustomMode(false);
                onChange("");
              }}
              title="Pick from existing values instead"
              className="shrink-0 rounded border border-[#d0ccc6] px-2 text-[13px] text-[#9a9490] hover:bg-[#f0ede9]"
            >
              ↩
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className={fieldLabelClass}>{label}</label>
      <select
        className={selectClass}
        value={value}
        onChange={(e) => {
          if (e.target.value === NEW_VALUE) {
            setCustomMode(true);
            onChange("");
          } else {
            onChange(e.target.value);
          }
        }}
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value={NEW_VALUE}>+ New value…</option>
      </select>
    </div>
  );
}

// Lets an admin add another cut/condition/region SKU to a product that
// already exists — until now, a new variant could only be created once,
// bundled into the "New Product" flow (createAdminProduct in
// adminProducts.ts). Used from both ProductDetailPanel's Variants tab and
// the standalone /admin/products/[id] page, since both list a product's
// variants but neither had a way to add one.
export function AddVariantForm({
  productId,
  facets,
  defaultOpen = false,
  onCancel,
  onCreated,
}: {
  productId: number;
  // Existing distinct values across the catalogue, for search-and-select
  // dropdowns instead of freetext — omit to fall back to plain text inputs.
  facets?: VariantAttributeFacets;
  // Skips the collapsed "+ Add Variant" toggle button and renders the form
  // expanded from the start — for callers that already gate this behind
  // their own trigger (e.g. AddVariantModal's product-picker flow).
  defaultOpen?: boolean;
  // When set, Cancel calls this instead of just collapsing back to the
  // toggle button — for embedding inside a modal, where "Cancel" should
  // close the whole modal rather than leave an empty shell behind.
  onCancel?: () => void;
  // Receives the newly created variant's id — lets a caller like
  // ProductVariantPicker auto-select what it just created instead of
  // making the admin search for it again right after making it.
  onCreated?: (result: { id: number }) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  function field<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function handleAdd() {
    setSaving(true);
    try {
      const res = await createAdminVariant({
        productId,
        sku: draft.sku || null,
        conditionType: draft.conditionType || null,
        cutType: draft.cutType || null,
        boneType: draft.boneType || null,
        skinType: draft.skinType || null,
        unit: draft.unit,
        stockStatus: draft.stockStatus,
        basePrice: draft.basePrice ? Number(draft.basePrice) : null,
      });
      toast.success("Variant added");
      setDraft(EMPTY_DRAFT);
      setOpen(false);
      onCreated?.(res.variant);
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-md border border-dashed border-[#d0ccc6] px-3 py-2 text-[13px] font-bold text-[#e05a4a] hover:bg-[#fdf2f1]"
      >
        + Add Variant
      </button>
    );
  }

  return (
    <div className="rounded-md border border-[#e4e1dc] bg-[#faf9f7] p-3">
      <div className="mb-2 text-[13px] font-bold tracking-wide text-[#9a9490] uppercase">New variant</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div>
          <label className={fieldLabelClass}>SKU</label>
          <input
            className={`${inputClass} font-[family-name:var(--font-plex-mono)]`}
            value={draft.sku}
            onChange={(e) => field("sku", e.target.value)}
          />
        </div>
        <FacetField
          label="Condition"
          value={draft.conditionType}
          onChange={(v) => field("conditionType", v)}
          options={facets?.conditions}
          placeholder="Fresh / Frozen"
        />
        <FacetField
          label="Cut"
          value={draft.cutType}
          onChange={(v) => field("cutType", v)}
          options={facets?.cutTypes}
        />
        <FacetField
          label="Bone"
          value={draft.boneType}
          onChange={(v) => field("boneType", v)}
          options={facets?.bones}
          placeholder="Bone-in / Boneless"
        />
        <FacetField
          label="Skin"
          value={draft.skinType}
          onChange={(v) => field("skinType", v)}
          options={facets?.skins}
          placeholder="With Skin / Skinless"
        />
        <div>
          <label className={fieldLabelClass}>Stock</label>
          <select
            className={selectClass}
            value={draft.stockStatus}
            onChange={(e) => field("stockStatus", e.target.value as Draft["stockStatus"])}
          >
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <label className="text-[13px] font-semibold text-[#9a9490] uppercase">Wholesale $</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="w-24 rounded border border-[#d0ccc6] px-1.5 py-1 text-right font-[family-name:var(--font-plex-mono)] text-[14px] font-bold text-[#c04535] outline-none focus:border-[#e05a4a]"
          value={draft.basePrice}
          onChange={(e) => field("basePrice", e.target.value)}
        />
        <select
          className="rounded border border-[#d0ccc6] px-1.5 py-1 text-[14px] text-[#5a5450] outline-none focus:border-[#e05a4a]"
          value={draft.unit}
          onChange={(e) => field("unit", e.target.value)}
          aria-label="Unit"
        >
          <option value="kg">/kg</option>
          <option value="lb">/lb</option>
          <option value="pack">/pack</option>
        </select>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => {
            setDraft(EMPTY_DRAFT);
            if (onCancel) {
              onCancel();
            } else {
              setOpen(false);
            }
          }}
          className="rounded px-2.5 py-1 text-[13px] font-semibold text-[#9a9490] hover:bg-[#f0ede9]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="flex h-7 items-center gap-1 rounded bg-[#1a1816] px-2.5 text-[13px] font-semibold text-white hover:bg-[#3a3632] disabled:opacity-50"
        >
          {saving ? "Adding…" : "+ Add Variant"}
        </button>
      </div>
    </div>
  );
}
