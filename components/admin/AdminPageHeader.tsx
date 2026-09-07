import type { ReactNode } from "react";

// The dark top bar every admin screen opens with — mirrors the mockup's
// .topbar (mono title, muted subtitle, right-aligned action slot).
export function AdminPageHeader({
  title,
  subtitle = "WeDoHalal Master Control",
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3.5 gap-y-2 bg-[#141312] px-4 py-2.5 sm:px-5">
      <div className="font-[family-name:var(--font-plex-mono)] text-[14px] font-semibold text-white">
        {title}
      </div>
      <div className="hidden text-[13px] text-[#5a5450] sm:block">{subtitle}</div>
      {children && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}

// A GET search box styled for the dark header, matching the mockup's
// .topbar-search. `children` can carry hidden inputs to preserve other
// query params (e.g. a status tab) across a search submit.
export function AdminHeaderSearch({
  action,
  name = "q",
  defaultValue,
  placeholder = "Search…",
  children,
}: {
  action: string;
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  children?: ReactNode;
}) {
  return (
    <form action={action} method="GET" className="flex w-full items-center gap-1.5 sm:w-auto">
      {children}
      <input
        type="text"
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full min-w-0 flex-1 rounded-md border border-[#2e2c2a] bg-[#1e1c1a] px-2.5 py-1.5 text-[14px] text-[#ccc] outline-none placeholder:text-[#5a5450] focus:border-[#e05a4a] sm:w-56 sm:flex-none"
      />
    </form>
  );
}

// Dark-header "ghost" button — used for Export links next to the search box.
export function AdminHeaderGhostLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-[5px] border border-[#3a3632] bg-[#1e1c1a] px-3 py-1.5 text-[14px] font-semibold text-[#aaa] hover:bg-[#2a2724] hover:text-white"
    >
      {children}
    </a>
  );
}

// Dark-header primary (pink) action button/link — "+ Add Product" etc.
export function AdminHeaderPrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-[5px] bg-[#e05a4a] px-3 py-1.5 text-[14px] font-semibold text-white hover:bg-[#c04535]"
    >
      {children}
    </a>
  );
}
