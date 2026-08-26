import type { ReactNode, SelectHTMLAttributes } from "react";
import Link from "next/link";

// The filter row directly under the page header — a <select> row, optional
// chip toggles, and a count badge, matching the mockup's .toolbar.
export function AdminToolbar({ children }: { children: ReactNode }) {
  return <div className="mb-3.5 flex flex-wrap items-center gap-2">{children}</div>;
}

export function AdminFilterSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return (
    <select
      {...rest}
      className={`rounded-md border border-[#d0ccc6] bg-white px-2.5 py-1.5 text-[14px] text-[#1a1816] outline-none focus:border-[#e05a4a] ${className}`}
    />
  );
}

const chipClass = (active?: boolean) =>
  `rounded-[3px] border px-2.5 py-1 text-[13px] font-bold whitespace-nowrap transition-colors ${
    active
      ? "border-[#e05a4a] bg-[#e05a4a] text-white"
      : "border-[#d0ccc6] bg-white text-[#5a5450] hover:bg-[#f0ede9]"
  }`;

// Client-side toggle chip (checkbox-backed, for filters applied without a
// full navigation) — matches the mockup's .tb-chip.
export function AdminChip({
  active,
  ...props
}: { active?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return <button type="button" {...rest} className={`${chipClass(active)} ${className}`} />;
}

// Server-rendered chip that navigates via a Link — for pages whose filters
// live in the URL (status tabs, category chips, etc.).
export function AdminChipLink({
  active,
  href,
  children,
}: {
  active?: boolean;
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={chipClass(active)}>
      {children}
    </Link>
  );
}

export function AdminToolbarSeparator() {
  return <div className="h-[18px] w-px bg-[#e4e1dc]" />;
}

export function AdminToolbarLabel({ children }: { children: ReactNode }) {
  return <span className="text-[13px] font-medium text-[#9a9490]">{children}</span>;
}

export function AdminToolbarSpacer() {
  return <div className="flex-1" />;
}

export function AdminCountBadge({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[3px] border border-[#e4e1dc] bg-[#f7f5f2] px-2 py-1 font-[family-name:var(--font-plex-mono)] text-[13px] whitespace-nowrap text-[#9a9490]">
      {children}
    </div>
  );
}

// Dark "primary" button for toolbar actions that aren't navigation (Filter
// submit, Bulk Markup, Publish All Prices).
export function AdminToolbarButton({
  variant = "dark",
  ...props
}: { variant?: "dark" | "pink" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  const base =
    variant === "pink"
      ? "bg-[#e05a4a] text-white hover:bg-[#c04535]"
      : "bg-[#1a1816] text-white hover:bg-[#3a3632]";
  return (
    <button
      type="submit"
      {...rest}
      className={`rounded-md px-3 py-1.5 text-[14px] font-semibold ${base} ${className}`}
    />
  );
}
