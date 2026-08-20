import type { ReactNode } from "react";

// Shared wrapper for every admin data table. Caps the table's own height
// and scrolls internally (both axes) with a sticky header, so a long list
// (e.g. 166 products) scrolls in place instead of growing the whole page —
// the sidebar and page filters stay put.
export function AdminTableCard({ children }: { children: ReactNode }) {
  return (
    <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-xl border border-neutral-200 bg-white [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-white">
      {children}
    </div>
  );
}
