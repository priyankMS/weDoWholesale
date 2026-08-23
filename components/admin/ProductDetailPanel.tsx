"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getAdminProductDetail,
  updateAdminProduct,
  type AdminProductDetail,
} from "@/lib/api/adminProducts";
import { updateAdminVariant } from "@/lib/api/adminVariants";
import { updateAdminPricing } from "@/lib/api/adminPricing";
import { getApiErrorMessage } from "@/lib/api/error";
import { computeSeoStatus, slugify } from "@/lib/seo";

type Tab = "info" | "variants" | "pricing" | "seo" | "images";

const TABS: { key: Tab; label: string }[] = [
  { key: "info", label: "Info" },
  { key: "variants", label: "Variants" },
  { key: "pricing", label: "Pricing" },
  { key: "seo", label: "SEO" },
  { key: "images", label: "Images" },
];

const inputClass =
  "w-full rounded-md border border-[#d0ccc6] bg-white px-2.5 py-1.5 text-[14px] text-[#1a1816] outline-none focus:border-[#e05a4a]";
const selectClass = `${inputClass} cursor-pointer bg-white`;
const labelClass = "mb-1 block text-[13px] font-semibold tracking-wide text-[#9a9490] uppercase";

type ProductFormState = {
  item: string;
  sku: string;
  category: string;
  type: string;
  shortDesc: string;
  longDesc1: string;
  metaTitle: string;
  metaDesc: string;
  thumbnailAlt: string;
  thumbnail: string;
  image1: string;
  image1Alt: string;
  image2: string;
  image2Alt: string;
  image3: string;
  image3Alt: string;
};

function toFormState(product: AdminProductDetail["product"]): ProductFormState {
  return {
    item: product.item ?? "",
    sku: product.sku ?? "",
    category: product.category ?? "",
    type: product.type ?? "",
    shortDesc: product.shortDesc ?? "",
    longDesc1: product.longDesc1 ?? "",
    metaTitle: product.metaTitle ?? "",
    metaDesc: product.metaDesc ?? "",
    thumbnailAlt: product.thumbnailAlt ?? "",
    thumbnail: product.thumbnail ?? "",
    image1: product.image1 ?? "",
    image1Alt: product.image1Alt ?? "",
    image2: product.image2 ?? "",
    image2Alt: product.image2Alt ?? "",
    image3: product.image3 ?? "",
    image3Alt: product.image3Alt ?? "",
  };
}

export function ProductDetailPanel({
  productId,
  onClose,
}: {
  productId: number | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<AdminProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("info");
  const [form, setForm] = useState<ProductFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingVariantId, setSavingVariantId] = useState<number | null>(null);
  const [savingPricingId, setSavingPricingId] = useState<number | null>(null);
  const [variantDrafts, setVariantDrafts] = useState<Record<number, Record<string, string>>>({});
  const [pricingDrafts, setPricingDrafts] = useState<Record<number, { dealer: string; markup: string; retail: string }>>({});

  useEffect(() => {
    if (productId == null) {
      setDetail(null);
      setForm(null);
      return;
    }
    setTab("info");
    setLoading(true);
    getAdminProductDetail(productId)
      .then((data) => {
        setDetail(data);
        setForm(toFormState(data.product));
        const vd: Record<number, Record<string, string>> = {};
        for (const v of data.variants) {
          vd[v.id] = {
            sku: v.sku ?? "",
            conditionType: v.conditionType ?? "",
            cutType: v.cutType ?? "",
            boneType: v.boneType ?? "",
            skinType: v.skinType ?? "",
            stockCount: String(v.stockCount ?? 0),
          };
        }
        setVariantDrafts(vd);
        const pd: Record<number, { dealer: string; markup: string; retail: string }> = {};
        for (const v of data.pricing) {
          for (const row of v.rows) {
            pd[row.id] = {
              dealer: row.dealerPrice != null ? String(row.dealerPrice) : "",
              markup: row.marginPercent != null ? row.marginPercent.toFixed(0) : "",
              retail: row.retailPrice != null ? String(row.retailPrice) : "",
            };
          }
        }
        setPricingDrafts(pd);
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [productId]);

  if (productId == null) return null;

  function field<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSaveProduct() {
    if (!form || productId == null) return;
    setSaving(true);
    try {
      await updateAdminProduct(productId, {
        item: form.item,
        sku: form.sku || null,
        category: form.category || null,
        type: form.type || null,
        shortDesc: form.shortDesc || null,
        longDesc1: form.longDesc1 || null,
        metaTitle: form.metaTitle || null,
        metaDesc: form.metaDesc || null,
        thumbnailAlt: form.thumbnailAlt || null,
        thumbnail: form.thumbnail || null,
        image1: form.image1 || null,
        image1Alt: form.image1Alt || null,
        image2: form.image2 || null,
        image2Alt: form.image2Alt || null,
        image3: form.image3 || null,
        image3Alt: form.image3Alt || null,
      });
      toast.success("Product saved");
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function variantField(variantId: number, key: string, value: string) {
    setVariantDrafts((d) => ({ ...d, [variantId]: { ...d[variantId], [key]: value } }));
  }

  async function handleSaveVariant(variantId: number) {
    const draft = variantDrafts[variantId];
    if (!draft) return;
    setSavingVariantId(variantId);
    try {
      await updateAdminVariant(variantId, {
        sku: draft.sku,
        conditionType: draft.conditionType,
        cutType: draft.cutType,
        boneType: draft.boneType,
        skinType: draft.skinType,
        stockCount: draft.stockCount ? Number(draft.stockCount) : null,
      });
      toast.success("Variant saved");
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingVariantId(null);
    }
  }

  function pricingField(rowId: number, key: "dealer" | "markup" | "retail", value: string) {
    setPricingDrafts((d) => {
      const current = d[rowId] ?? { dealer: "", markup: "", retail: "" };
      const next = { ...current, [key]: value };
      // Editing dealer price or markup% recomputes retail live, matching
      // the mockup's Pricing tab behaviour.
      if (key === "dealer" || key === "markup") {
        const dealer = Number(key === "dealer" ? value : next.dealer);
        const markup = Number(key === "markup" ? value : next.markup);
        if (dealer > 0 && !Number.isNaN(markup)) {
          next.retail = (dealer * (1 + markup / 100)).toFixed(2);
        }
      }
      return { ...d, [rowId]: next };
    });
  }

  async function handleSavePricing(rowId: number) {
    const draft = pricingDrafts[rowId];
    if (!draft) return;
    setSavingPricingId(rowId);
    try {
      await updateAdminPricing(rowId, {
        dealerPrice: draft.dealer ? Number(draft.dealer) : null,
        retailPrice: draft.retail ? Number(draft.retail) : null,
      });
      toast.success("Price saved");
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingPricingId(null);
    }
  }

  const seoPreview = form
    ? computeSeoStatus({
        metaTitle: form.metaTitle,
        metaDesc: form.metaDesc,
        hasAltTag: !!form.thumbnailAlt.trim(),
      })
    : { status: "missing" as const, score: 0 };
  const slug = form ? slugify(form.item) : "";

  return (
    <>
      <div
        className="fixed inset-0 z-[199] bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed top-0 right-0 z-[200] flex h-screen w-full max-w-[700px] flex-col bg-white shadow-2xl">
        <div className="flex shrink-0 items-center gap-3 bg-[#141312] px-4.5 py-3">
          <div className="min-w-0 flex-1">
            <div className="truncate font-[family-name:var(--font-plex-mono)] text-[16px] font-semibold text-white">
              {form?.item || "Loading…"}
            </div>
            <div className="text-[14px] text-[#7a7470]">SKU: {form?.sku || "—"}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[16px] text-[#7a7470] hover:text-white"
            aria-label="Close"
          >
            ✕ Close
          </button>
        </div>

        <div className="flex shrink-0 border-b border-[#2a2724] bg-[#1a1917]">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`border-b-2 px-4 py-2 text-[14px] font-semibold transition-colors ${
                tab === t.key
                  ? "border-[#e05a4a] text-white"
                  : "border-transparent text-[#6a6460] hover:text-[#aaa]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading || !detail || !form ? (
            <div className="py-10 text-center text-[14px] text-[#9a9490]">Loading…</div>
          ) : (
            <>
              {tab === "info" && (
                <div className="space-y-4">
                  <div>
                    <div className="mb-2.5 border-b border-[#e4e1dc] pb-1.5 text-[13px] font-bold tracking-widest text-[#9a9490] uppercase">
                      Basic Information
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className={labelClass}>Product Name</label>
                        <input
                          className={inputClass}
                          value={form.item}
                          onChange={(e) => field("item", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>SKU</label>
                        <input
                          className={`${inputClass} font-[family-name:var(--font-plex-mono)]`}
                          value={form.sku}
                          onChange={(e) => field("sku", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Category</label>
                        <select
                          className={selectClass}
                          value={form.category}
                          onChange={(e) => field("category", e.target.value)}
                        >
                          {!detail.categories.includes(form.category) && form.category && (
                            <option value={form.category}>{form.category}</option>
                          )}
                          {detail.categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Part / Type</label>
                        <input
                          className={inputClass}
                          value={form.type}
                          onChange={(e) => field("type", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2.5 border-b border-[#e4e1dc] pb-1.5 text-[13px] font-bold tracking-widest text-[#9a9490] uppercase">
                      Descriptions
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <label className={labelClass}>Short Description</label>
                        <textarea
                          className={`${inputClass} min-h-[50px] resize-y`}
                          value={form.shortDesc}
                          onChange={(e) => field("shortDesc", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Long Description</label>
                        <textarea
                          className={`${inputClass} min-h-[80px] resize-y`}
                          value={form.longDesc1}
                          onChange={(e) => field("longDesc1", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2.5 border-b border-[#e4e1dc] pb-1.5 text-[13px] font-bold tracking-widest text-[#9a9490] uppercase">
                      Computed from variants
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 text-[14px] sm:grid-cols-4">
                      <div className="rounded-md border border-[#e4e1dc] px-2.5 py-2">
                        <div className="text-[13px] text-[#9a9490] uppercase">Variants</div>
                        <div className="font-semibold text-[#1a1816]">{detail.variants.length}</div>
                      </div>
                      <div className="rounded-md border border-[#e4e1dc] px-2.5 py-2">
                        <div className="text-[13px] text-[#9a9490] uppercase">Suppliers</div>
                        <div className="font-semibold text-[#1a1816]">
                          {Array.from(new Set(detail.variants.flatMap((v) => v.supplierNames))).join(
                            ", ",
                          ) || "—"}
                        </div>
                      </div>
                      <div className="rounded-md border border-[#e4e1dc] px-2.5 py-2">
                        <div className="text-[13px] text-[#9a9490] uppercase">Retail from</div>
                        <div className="font-semibold text-[#e05a4a]">
                          {(() => {
                            const prices = detail.variants
                              .map((v) => v.basePrice)
                              .filter((p): p is number => p != null);
                            return prices.length ? `$${Math.min(...prices).toFixed(2)}` : "—";
                          })()}
                        </div>
                      </div>
                      <div className="rounded-md border border-[#e4e1dc] px-2.5 py-2">
                        <div className="text-[13px] text-[#9a9490] uppercase">Stock status</div>
                        <div className="font-semibold text-[#1a1816]">
                          {(() => {
                            const states = detail.variants.map((v) => v.stockState);
                            const overall = states.includes("in")
                              ? "In stock"
                              : states.includes("low")
                                ? "Low stock"
                                : states.length
                                  ? "Out of stock"
                                  : "—";
                            return overall;
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-1.5 text-[13px] text-[#c4c0bc]">
                      Stock is tracked per variant — edit it on the Variants tab.
                    </div>
                  </div>
                </div>
              )}

              {tab === "variants" && (
                <div>
                  <div className="mb-2.5 text-[13px] font-bold tracking-widest text-[#9a9490] uppercase">
                    Variants for {form.item} ({detail.variants.length})
                  </div>
                  <div className="space-y-2">
                    {detail.variants.map((v) => {
                      const draft = variantDrafts[v.id] ?? {
                        sku: v.sku ?? "",
                        conditionType: v.conditionType ?? "",
                        cutType: v.cutType ?? "",
                        boneType: v.boneType ?? "",
                        skinType: v.skinType ?? "",
                        stockCount: String(v.stockCount ?? 0),
                      };
                      return (
                        <div
                          key={v.id}
                          className="grid grid-cols-[110px_90px_90px_80px_80px_60px_28px] items-center gap-1.5 border-b border-[#e4e1dc] pb-2 text-[14px]"
                        >
                          <input
                            className={`${inputClass} font-[family-name:var(--font-plex-mono)] text-[14px]`}
                            value={draft.sku}
                            onChange={(e) => variantField(v.id, "sku", e.target.value)}
                          />
                          <select
                            className={selectClass}
                            value={draft.conditionType}
                            onChange={(e) => variantField(v.id, "conditionType", e.target.value)}
                          >
                            <option value="">—</option>
                            {detail.facets.conditions.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <input
                            className={inputClass}
                            value={draft.cutType}
                            onChange={(e) => variantField(v.id, "cutType", e.target.value)}
                            placeholder="Cut"
                          />
                          <select
                            className={selectClass}
                            value={draft.boneType}
                            onChange={(e) => variantField(v.id, "boneType", e.target.value)}
                          >
                            <option value="">N/A</option>
                            {detail.facets.bones.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                          <select
                            className={selectClass}
                            value={draft.skinType}
                            onChange={(e) => variantField(v.id, "skinType", e.target.value)}
                          >
                            <option value="">N/A</option>
                            {detail.facets.skins.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className={inputClass}
                            value={draft.stockCount}
                            onChange={(e) => variantField(v.id, "stockCount", e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveVariant(v.id)}
                            disabled={savingVariantId === v.id}
                            className="flex h-6 w-6 items-center justify-center rounded text-[#9a9490] hover:bg-[#fdf2f1] hover:text-[#e05a4a] disabled:opacity-50"
                            aria-label="Save variant"
                          >
                            💾
                          </button>
                        </div>
                      );
                    })}
                    {detail.variants.length === 0 && (
                      <div className="py-6 text-center text-[14px] text-[#9a9490]">
                        No variants yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab === "pricing" && (
                <div>
                  <div className="mb-1 text-[13px] font-bold tracking-widest text-[#9a9490] uppercase">
                    Pricing per variant — {form.item}
                  </div>
                  <div className="mb-3 text-[14px] text-[#9a9490]">
                    Editing supplier price or markup % recalculates retail price live.
                  </div>
                  {detail.pricing.map((v) => (
                    <div key={v.variantId} className="mb-3">
                      <div className="mb-1 text-[14px] font-semibold text-[#1a1816]">
                        {v.variantLabel}{" "}
                        <span className="font-[family-name:var(--font-plex-mono)] font-normal text-[#9a9490]">
                          {v.sku}
                        </span>
                      </div>
                      <table className="w-full text-[14px]">
                        <thead>
                          <tr className="bg-[#f0ede9]">
                            <th className="px-2 py-1 text-left text-[13px] font-semibold text-[#5a5450] uppercase">
                              Supplier
                            </th>
                            <th className="px-2 py-1 text-left text-[13px] font-semibold text-[#5a5450] uppercase">
                              Sup. Price
                            </th>
                            <th className="px-2 py-1 text-left text-[13px] font-semibold text-[#5a5450] uppercase">
                              Markup %
                            </th>
                            <th className="px-2 py-1 text-left text-[13px] font-semibold text-[#5a5450] uppercase">
                              Retail Price
                            </th>
                            <th className="w-8" />
                          </tr>
                        </thead>
                        <tbody>
                          {v.rows.map((row) => {
                            const draft = pricingDrafts[row.id] ?? { dealer: "", markup: "", retail: "" };
                            return (
                              <tr key={row.id} className="border-b border-[#e4e1dc]">
                                <td className="px-2 py-1.5 text-[#5a5450]">
                                  {row.supplierName ?? "—"}
                                </td>
                                <td className="px-2 py-1.5">
                                  <input
                                    className="w-20 rounded border border-[#d0ccc6] px-1.5 py-1 text-right font-[family-name:var(--font-plex-mono)] text-[14px] outline-none focus:border-[#e05a4a]"
                                    value={draft.dealer}
                                    onChange={(e) => pricingField(row.id, "dealer", e.target.value)}
                                  />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input
                                    className="w-14 rounded border border-[#f5c4be] bg-[#fff8e0] px-1.5 py-1 text-right font-[family-name:var(--font-plex-mono)] text-[14px] outline-none focus:border-[#c48a00]"
                                    value={draft.markup}
                                    onChange={(e) => pricingField(row.id, "markup", e.target.value)}
                                  />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input
                                    className="w-20 rounded border border-[#d0ccc6] px-1.5 py-1 text-right font-[family-name:var(--font-plex-mono)] text-[14px] font-bold text-[#c04535] outline-none focus:border-[#e05a4a]"
                                    value={draft.retail}
                                    onChange={(e) => pricingField(row.id, "retail", e.target.value)}
                                  />
                                </td>
                                <td className="px-1">
                                  <button
                                    type="button"
                                    onClick={() => handleSavePricing(row.id)}
                                    disabled={savingPricingId === row.id}
                                    className="flex h-6 w-6 items-center justify-center rounded text-[#9a9490] hover:bg-[#fdf2f1] hover:text-[#e05a4a] disabled:opacity-50"
                                    aria-label="Save price"
                                  >
                                    💾
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {v.rows.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-2 py-2 text-[#9a9490]">
                                No supplier pricing yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {tab === "seo" && (
                <div className="space-y-3.5">
                  <div className="mb-1 text-[13px] font-bold tracking-widest text-[#9a9490] uppercase">
                    SEO / Meta content — {form.item}
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between">
                      <label className={labelClass}>Meta Title</label>
                      <span className="text-[13px] text-[#c4c0bc]">{form.metaTitle.length}/60 chars</span>
                    </div>
                    <input
                      className={inputClass}
                      value={form.metaTitle}
                      onChange={(e) => field("metaTitle", e.target.value)}
                    />
                    <div className="mt-0.5 text-[13px] text-[#c4c0bc]">
                      Ideal: 30–60 characters. Appears in Google search results.
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between">
                      <label className={labelClass}>Meta Description</label>
                      <span className="text-[13px] text-[#c4c0bc]">{form.metaDesc.length}/160 chars</span>
                    </div>
                    <textarea
                      className={`${inputClass} min-h-[60px] resize-y`}
                      value={form.metaDesc}
                      onChange={(e) => field("metaDesc", e.target.value)}
                    />
                    <div className="mt-0.5 text-[13px] text-[#c4c0bc]">
                      Ideal: 100–160 characters. Shown below title in Google results.
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>Image Alt Tag</label>
                      <input
                        className={inputClass}
                        value={form.thumbnailAlt}
                        onChange={(e) => field("thumbnailAlt", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>URL Slug (preview only)</label>
                      <input
                        className={`${inputClass} font-[family-name:var(--font-plex-mono)] text-[14px]`}
                        value={slug}
                        readOnly
                      />
                      <div className="mt-0.5 text-[13px] text-[#c4c0bc]">
                        Derived from the name — this site links products by ID, not slug.
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={labelClass}>Google Preview</div>
                    <div className="rounded-md border border-[#e4e1dc] bg-[#f7f5f2] p-3">
                      <div className="mb-0.5 font-[family-name:var(--font-plex-mono)] text-[14px] text-[#1e8a4a]">
                        wedohalal.com › products › {slug || "…"}
                      </div>
                      <div className="mb-0.5 cursor-pointer text-[16px] font-semibold text-[#1a0dab] hover:underline">
                        {form.metaTitle || form.item}
                      </div>
                      <div className="text-[14px] leading-normal text-[#4d5156]">
                        {form.metaDesc || "No meta description set."}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className={labelClass}>SEO Score</span>
                      <span className="text-[14px] font-bold text-[#1a1816]">{seoPreview.score}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-[#e4e1dc]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          seoPreview.status === "complete"
                            ? "bg-[#1e8a4a]"
                            : seoPreview.status === "warning"
                              ? "bg-[#c48a00]"
                              : "bg-[#e05a4a]"
                        }`}
                        style={{ width: `${seoPreview.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {tab === "images" && (
                <div>
                  <div className="mb-2.5 text-[13px] font-bold tracking-widest text-[#9a9490] uppercase">
                    Product Images
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { label: "Thumbnail (main)", urlKey: "thumbnail", altKey: "thumbnailAlt" },
                        { label: "Image 1", urlKey: "image1", altKey: "image1Alt" },
                        { label: "Image 2", urlKey: "image2", altKey: "image2Alt" },
                        { label: "Image 3", urlKey: "image3", altKey: "image3Alt" },
                      ] as const
                    ).map((slot) => (
                      <div key={slot.urlKey} className="rounded-md border border-[#e4e1dc] p-2.5">
                        <div className="mb-1.5 text-[13px] font-semibold text-[#9a9490] uppercase">
                          {slot.label}
                        </div>
                        <div className="mb-2 flex h-24 items-center justify-center overflow-hidden rounded bg-[#f7f5f2]">
                          {form[slot.urlKey] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={form[slot.urlKey]}
                              alt={form[slot.altKey] || slot.label}
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-[14px] text-[#c4c0bc]">No image URL set</span>
                          )}
                        </div>
                        <input
                          className={`${inputClass} mb-1.5`}
                          placeholder="Image URL"
                          value={form[slot.urlKey]}
                          onChange={(e) => field(slot.urlKey, e.target.value)}
                        />
                        <input
                          className={inputClass}
                          placeholder="Alt text"
                          value={form[slot.altKey]}
                          onChange={(e) => field(slot.altKey, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-[#e4e1dc] bg-[#f7f5f2] px-5 py-2.5">
          <button
            type="button"
            onClick={handleSaveProduct}
            disabled={saving || !form}
            className="rounded-[5px] bg-[#e05a4a] px-4 py-1.5 text-[14px] font-bold text-white hover:bg-[#c04535] disabled:opacity-50"
          >
            💾 Save Changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[5px] border border-[#d0ccc6] bg-white px-3.5 py-1.5 text-[14px] font-semibold text-[#5a5450]"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
