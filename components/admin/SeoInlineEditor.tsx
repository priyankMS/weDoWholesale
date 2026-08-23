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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-bold text-red-600 hover:underline"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-1 text-[0.9rem] font-extrabold text-neutral-900">{productName}</h3>
        <p className="mb-4 text-[0.84rem] text-neutral-500">Edit SEO metadata</p>

        <div className="mb-3.5">
          <label className="mb-1.5 block text-[0.8rem] font-bold text-neutral-500">
            Meta Title ({metaTitle.length} chars)
          </label>
          <input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-[0.86rem] outline-none focus:border-red-500"
          />
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-[0.8rem] font-bold text-neutral-500">
            Meta Description ({metaDesc.length} chars)
          </label>
          <textarea
            value={metaDesc}
            onChange={(e) => setMetaDesc(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-[0.86rem] outline-none focus:border-red-500"
          />
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-[0.9rem] font-bold text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-red-600 px-4 py-2 text-[0.9rem] font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
