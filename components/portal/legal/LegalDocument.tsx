import Link from "next/link";
import { type ReactNode } from "react";

export type LegalTocItem = { id: string; num: string; title: string };
export type LegalMetaItem = { icon: string; label: string };

const ALL_POLICIES: { href: string; label: string }[] = [
  { href: "/legal/terms", label: "Terms & conditions" },
  { href: "/legal/privacy", label: "Privacy policy" },
  { href: "/legal/delivery", label: "Delivery policy" },
];

// Shared shell for Screens 32-34 (Terms & Conditions, Privacy Policy,
// Delivery Policy). Mobile renders the mockup's colored `.policy-hero` +
// `.toc-card` (screens 32/33 only — screen 34's Delivery Policy has no
// table of contents in the mobile source, so `toc` is left undefined
// there). Desktop adopts the dark in-page TOC sidebar + plain page header
// pattern introduced by the desktop-preview file (that file has no
// <script> tag — it's a static preview, not an interactive replacement —
// so only its layout/structure is adopted here, not its abbreviated,
// differently-numbered copy; full section copy always comes from the
// mobile source, matching the sibling Account/Communication phases'
// approach to their own desktop-only frames).
export function LegalDocument({
  docHref,
  backHref = "/account",
  backLabel = "Account",
  eyebrow,
  title,
  icon,
  mobileMeta,
  kicker,
  metaItems,
  toc,
  children,
  footer,
}: {
  docHref: string;
  backHref?: string;
  backLabel?: string;
  eyebrow: string;
  title: string;
  icon: string;
  mobileMeta: string;
  kicker: string;
  metaItems: LegalMetaItem[];
  toc?: LegalTocItem[];
  children: ReactNode;
  footer: ReactNode;
}) {
  const otherPolicies = ALL_POLICIES.filter((p) => p.href !== docHref);

  return (
    <div className="pb-8 lg:px-6 lg:pt-6">
      {/* Mobile topbar */}
      <div className="border-b-[1.5px] border-neutral-200 bg-white px-4.5 py-3.5 lg:hidden">
        <Link href={backHref} className="text-[0.88rem] font-bold text-primary-500">
          ← {backLabel}
        </Link>
        <div className="mt-1.5 font-serif text-[1.2rem] font-bold text-neutral-900">{title}</div>
      </div>

      {/* Mobile hero */}
      <div className="relative mx-4 mt-3.5 overflow-hidden rounded-2xl bg-primary-500 px-5 py-5.5 text-white lg:hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute right-3.5 -bottom-2 text-[5rem] opacity-10"
        >
          {icon}
        </span>
        <div className="relative mb-1.25 text-[0.66rem] font-extrabold tracking-widest uppercase opacity-80">
          {eyebrow}
        </div>
        <div className="relative mb-1.5 font-serif text-[1.3rem] font-black leading-tight">
          {title}
        </div>
        <div className="relative text-[0.75rem] font-semibold opacity-85">{mobileMeta}</div>
      </div>

      {/* Mobile table of contents */}
      {toc && toc.length > 0 && (
        <div className="mx-4 mt-2.5 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:hidden">
          <div className="border-b border-neutral-200 px-4 py-3 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Contents
          </div>
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="flex items-center gap-2.5 border-b border-neutral-200 px-4 py-2.75 text-[0.84rem] font-semibold text-neutral-900 last:border-b-0 active:bg-neutral-50"
            >
              <span className="w-5.5 shrink-0 font-serif text-[1rem] font-bold text-primary-200">
                {item.num}
              </span>
              {item.title}
              <span className="ml-auto text-[0.9rem] text-neutral-300">›</span>
            </a>
          ))}
        </div>
      )}

      <div className="lg:flex lg:items-start lg:gap-9 lg:pt-8">
        {/* Desktop TOC sidebar — genuinely new in the desktop-preview
            file's `.toc-sidebar`, not present in the mobile source at all. */}
        {toc && toc.length > 0 && (
          <div className="hidden w-60 shrink-0 self-start overflow-hidden rounded-2xl bg-charcoal-900 py-5 lg:sticky lg:top-24 lg:block">
            <div className="mb-1 border-b border-white/10 px-5 pb-4">
              <div className="font-serif text-[0.9rem] font-black text-white">{title}</div>
              <div className="mt-1 text-[0.62rem] text-white/30">{mobileMeta}</div>
            </div>
            <div className="px-5 pt-4 pb-1.5 text-[0.6rem] font-extrabold tracking-widest text-white/25 uppercase">
              Sections
            </div>
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block border-l-[3px] border-transparent px-5 py-2 text-[0.76rem] font-semibold text-white/50 transition-colors hover:bg-white/5 hover:text-white"
              >
                <span className="mr-1.5 text-[0.62rem] font-extrabold text-white/20">
                  {item.num}.
                </span>
                {item.title}
              </a>
            ))}
            {otherPolicies.length > 0 && (
              <>
                <div className="px-5 pt-4 pb-1.5 text-[0.6rem] font-extrabold tracking-widest text-white/25 uppercase">
                  Other policies
                </div>
                {otherPolicies.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="block border-l-[3px] border-transparent px-5 py-2 text-[0.76rem] font-semibold text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <span className="mr-1.5 text-[0.62rem] font-extrabold text-white/20">↗</span>
                    {p.label}
                  </Link>
                ))}
              </>
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Desktop plain page header, replacing the mobile colored hero —
              same mobile-colored / desktop-plain split as AccountPage. */}
          <div className="mb-7 hidden border-b-2 border-neutral-200 pb-6 lg:block">
            <div className="mb-2 text-[0.7rem] font-extrabold tracking-widest text-primary-500 uppercase">
              {kicker}
            </div>
            <div className="mb-2.5 font-serif text-[2rem] font-black text-neutral-900">
              {title}
            </div>
            <div className="flex flex-wrap gap-5 text-[0.78rem] text-neutral-400">
              {metaItems.map((m) => (
                <span key={m.label} className="flex items-center gap-1.5">
                  {m.icon} {m.label}
                </span>
              ))}
            </div>
          </div>

          {children}

          {footer}
        </div>
      </div>
    </div>
  );
}
