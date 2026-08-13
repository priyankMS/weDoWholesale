import { type ReactNode } from "react";

export function NoticeCard({
  icon,
  title,
  children,
  tone = "neutral",
}: {
  icon: string;
  title: string;
  children: ReactNode;
  tone?: "neutral" | "warning";
}) {
  const toneClass =
    tone === "warning"
      ? "border-amber-300 bg-amber-50"
      : "border-neutral-200 bg-white";

  return (
    <div
      className={`mb-3 flex items-start gap-3 rounded-2xl border-[1.5px] p-4 ${toneClass}`}
    >
      <div className="mt-0.5 shrink-0 text-2xl leading-none">{icon}</div>
      <div>
        <div className="mb-0.75 text-[0.85rem] font-extrabold text-neutral-900">
          {title}
        </div>
        <div className="text-[0.78rem] leading-relaxed text-neutral-700">
          {children}
        </div>
      </div>
    </div>
  );
}
