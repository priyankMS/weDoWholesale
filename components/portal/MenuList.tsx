import Link from "next/link";
import { type ReactNode } from "react";

export function MenuList({ children }: { children: ReactNode }) {
  return (
    <div className="mx-4 mb-3.5 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
      {children}
    </div>
  );
}

const ICON_TONE = {
  pink: "bg-primary-50",
  green: "bg-green-50",
  amber: "bg-amber-50",
  blue: "bg-blue-50",
  gray: "bg-neutral-100",
} as const;

export function MenuItem({
  href,
  onClick,
  icon,
  tone,
  label,
  sub,
  badge,
  external,
}: {
  href?: string;
  onClick?: () => void;
  icon: string;
  tone: keyof typeof ICON_TONE;
  label: string;
  sub?: string;
  badge?: string | number;
  external?: boolean;
}) {
  const content = (
    <>
      <div
        className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[9px] text-[1.1rem] ${ICON_TONE[tone]}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[0.9rem] font-semibold text-neutral-900">{label}</div>
        {sub && <div className="mt-0.25 text-[0.72rem] font-medium text-neutral-400">{sub}</div>}
      </div>
      {badge != null && (
        <span className="shrink-0 rounded-full bg-primary-500 px-2.25 py-0.75 text-[0.66rem] font-extrabold text-white">
          {badge}
        </span>
      )}
      <span className="shrink-0 text-[1rem] text-neutral-300">›</span>
    </>
  );

  const className =
    "flex items-center gap-3.5 px-4 py-3.75 text-left transition-colors hover:bg-neutral-50 active:bg-neutral-50";

  if (href) {
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`w-full ${className}`}>
      {content}
    </button>
  );
}
