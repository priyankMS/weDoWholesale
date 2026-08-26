import type { ReactNode } from "react";

export type AdminBadgeTone = "neutral" | "category" | "green" | "amber" | "red" | "blue" | "pink";

const TONE_CLASSES: Record<AdminBadgeTone, string> = {
  neutral: "bg-[#f0ede9] text-[#8a8480]",
  category: "bg-[#e8e4e0] text-[#5a5450]",
  green: "bg-[#e8f7ef] text-[#1e8a4a]",
  amber: "bg-[#fff8e0] text-[#c48a00]",
  red: "bg-[#fde8e8] text-[#cc2222]",
  blue: "bg-[#e8eef8] text-[#1a6fcc]",
  pink: "bg-[#fdf2f1] text-[#e05a4a]",
};

// Canonical pill used for every status/category/stock/supplier tag across the
// admin — colors match the wedohalal-master-admin.html mockup's badge-* classes
// exactly, so a "Live" pill on Products looks identical to one on Orders.
export function AdminBadge({
  tone = "neutral",
  mono = false,
  children,
}: {
  tone?: AdminBadgeTone;
  mono?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-[3px] px-1.5 py-px text-[13px] font-bold whitespace-nowrap ${TONE_CLASSES[tone]} ${
        mono ? "font-[family-name:var(--font-plex-mono)] text-[12px]" : ""
      }`}
    >
      {children}
    </span>
  );
}
