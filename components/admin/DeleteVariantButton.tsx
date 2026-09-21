"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteAdminVariant } from "@/lib/api/adminVariants";
import { getApiErrorMessage } from "@/lib/api/error";

export function DeleteVariantButton({
  variantId,
  onDeleted,
  redirectTo,
  className,
  label = "🗑️",
  confirmLabel = "Delete this variant? This can't be undone.",
}: {
  variantId: number;
  onDeleted?: () => void;
  // Set on pages that show a single variant by id (e.g. the edit page) —
  // after deleting, that id no longer resolves, so we navigate away
  // instead of just refreshing in place.
  redirectTo?: string;
  className?: string;
  label?: string;
  confirmLabel?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmLabel)) return;
    setDeleting(true);
    try {
      await deleteAdminVariant(variantId);
      toast.success("Variant deleted");
      onDeleted?.();
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      aria-label="Delete variant"
      className={className ?? "rounded p-1 text-[15px] hover:bg-[#fdf2f1] disabled:opacity-50"}
    >
      {deleting ? "…" : label}
    </button>
  );
}
