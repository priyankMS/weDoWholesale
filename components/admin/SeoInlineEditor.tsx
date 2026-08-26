"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAdminProduct } from "@/lib/api/adminProducts";
import { getApiErrorMessage } from "@/lib/api/error";

export function SeoInlineEditor({
  productId,
  productName,
  initialMetaTitle,
  initialMetaDesc,
}: {
  productId: number;
  productName: string;
  initialMetaTitle: string | null;
  initialMetaDesc: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [metaTitle, setMetaTitle] = useState(initialMetaTitle ?? "");
  const [metaDesc, setMetaDesc] = useState(initialMetaDesc ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateAdminProduct(productId, { item: productName, metaTitle, metaDesc });
      toast.success("SEO fields saved");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded p-1 text-[15px] hover:bg-[#fdf2f1]" aria-label="Edit SEO">
        ✏️
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-md bg-white shadow-xl">
        <div className="bg-[#141312] px-5 py-3">
          <h3 className="font-[family-name:var(--font-plex-mono)] text-[15px] font-semibold text-white">
            {productName}
          </h3>
          <p className="text-[13px] text-[#7a7470]">Edit SEO metadata</p>
        </div>

        <div className="p-5">
          <div className="mb-3.5">
            <div className="mb-1 flex items-baseline justify-between">
              <label className="text-[13px] font-semibold tracking-wide text-[#9a9490] uppercase">Meta Title</label>
              <span className="text-[13px] text-[#c4c0bc]">{metaTitle.length}/60 chars</span>
            </div>
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full rounded-md border border-[#d0ccc6] bg-white px-2.5 py-1.5 text-[14px] text-[#1a1816] outline-none focus:border-[#e05a4a]"
            />
          </div>

          <div className="mb-5">
            <div className="mb-1 flex items-baseline justify-between">
              <label className="text-[13px] font-semibold tracking-wide text-[#9a9490] uppercase">
                Meta Description
              </label>
              <span className="text-[13px] text-[#c4c0bc]">{metaDesc.length}/160 chars</span>
            </div>
            <textarea
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-[#d0ccc6] bg-white px-2.5 py-1.5 text-[14px] text-[#1a1816] outline-none focus:border-[#e05a4a]"
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-[5px] border border-[#d0ccc6] bg-white px-3.5 py-1.5 text-[14px] font-semibold text-[#5a5450] hover:bg-[#f0ede9]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-[5px] bg-[#e05a4a] px-4 py-1.5 text-[14px] font-bold text-white hover:bg-[#c04535] disabled:opacity-60"
            >
              {saving ? "Saving…" : "💾 Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
