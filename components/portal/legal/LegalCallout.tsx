import { type ReactNode } from "react";

// Screens 32-34's `.key-term` / `.info-box` / `.warn-box` inline callouts.
const TONES = {
  key: "border-primary-200 bg-primary-50 text-primary-700",
  info: "border-green-200 bg-green-50 text-green-700",
  warn: "border-amber-300 bg-amber-50 text-amber-800",
} as const;

export function LegalCallout({
  tone,
  icon,
  children,
}: {
  tone: keyof typeof TONES;
  icon: string;
  children: ReactNode;
}) {
  return (
    <div className={`my-2.5 flex items-start gap-2.5 rounded-xl border-[1.5px] p-3.25 ${TONES[tone]}`}>
      <span className="mt-0.25 shrink-0 text-[1.05rem] leading-none">{icon}</span>
      <div className="text-[0.8rem] leading-relaxed font-semibold">{children}</div>
    </div>
  );
}
