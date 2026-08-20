import { type ReactNode } from "react";

// Shared "nothing here yet" block — same shape (icon, title, description,
// optional action) already duplicated inline across Phase 2/3 pages
// (search's "type to search" / "no results" states, saved's "no saved
// items" state, cart's "cart is empty" state). Phase 8 (Utility and Error)
// extracts it into a reusable primitive; see call sites in
// app/(portal)/search/page.tsx and app/(portal)/saved/page.tsx.
export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="px-8 py-12 text-center">
      <div className="mb-3 text-[3.5rem]">{icon}</div>
      <div className="mb-2 font-serif text-[1.2rem] font-bold text-neutral-900">{title}</div>
      {children && (
        <div className="text-[0.84rem] leading-relaxed text-neutral-500">{children}</div>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
