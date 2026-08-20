import Link from "next/link";
import { type ReactNode } from "react";

// Shared header for every /account/* sub-screen — mobile renders the
// mockup's per-screen `.topbar` (back link + serif title), desktop renders
// its `.page-header` (big serif title + subtitle + optional primary
// action), reusing the same props rather than forking markup per page.
export function AccountHeader({
  title,
  subtitle,
  backHref = "/account",
  backLabel = "Account",
  mobileAction,
  desktopAction,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  mobileAction?: ReactNode;
  desktopAction?: ReactNode;
}) {
  return (
    <>
      <div className="border-b-[1.5px] border-neutral-200 bg-white px-4.5 py-3.5 lg:hidden">
        <div className="flex items-center justify-between">
          <Link href={backHref} className="text-[0.88rem] font-bold text-primary-500">
            ← {backLabel}
          </Link>
          {mobileAction}
        </div>
        <div className="mt-1.5 font-serif text-[1.2rem] font-bold text-neutral-900">{title}</div>
      </div>

      <div className="mb-5 hidden items-start justify-between px-4 pt-6 lg:flex lg:px-0">
        <div>
          <div className="font-serif text-[1.6rem] font-black text-neutral-900">{title}</div>
          {subtitle && <div className="mt-1 text-[0.82rem] text-neutral-400">{subtitle}</div>}
        </div>
        {desktopAction}
      </div>
    </>
  );
}
