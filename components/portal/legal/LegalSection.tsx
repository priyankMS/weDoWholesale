import { type ReactNode } from "react";

// Screens 32-34's `.policy-section-card` — a bordered white card with a
// numbered (or emoji-badged, for Delivery Policy) heading row and a body
// slot. Reused as-is at the desktop breakpoint (just a wider column),
// matching how other portal content pages (e.g. HalalCertsPage,
// SupportPage) keep the same card styling across breakpoints rather than
// forking markup.
export function LegalSection({
  id,
  num,
  icon,
  title,
  children,
}: {
  id: string;
  num?: string;
  icon?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="mx-4 mb-2.5 scroll-mt-24 lg:mx-0 lg:mb-4 lg:scroll-mt-28">
      <div className="overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white">
        <div className="flex items-center gap-2.5 border-b border-neutral-200 bg-neutral-50 px-4 py-3.25">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 font-serif text-[0.75rem] font-black text-white">
            {icon ?? num}
          </span>
          <span className="font-serif text-[0.9rem] font-extrabold text-neutral-900">
            {title}
          </span>
        </div>
        <div className="px-4 py-3.75 text-[0.82rem] leading-relaxed text-neutral-500 [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-4 [&_ul:last-child]:mb-0 [&_strong]:font-bold [&_strong]:text-neutral-900 [&_a]:font-bold [&_a]:text-primary-500">
          {children}
        </div>
      </div>
    </div>
  );
}
