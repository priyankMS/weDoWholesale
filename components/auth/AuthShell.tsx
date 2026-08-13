import Link from "next/link";
import { type ReactNode } from "react";
import { HalalBadge } from "@/components/ui/HalalBadge";

const TRUST_ITEMS = [
  { icon: "📦", text: "100 kg minimum order for delivery" },
  { icon: "🚚", text: "Next-day delivery — order before 3 PM" },
  { icon: "✓", text: "ISNA / HMC / IFANCA certified halal" },
  { icon: "📅", text: "Net 15 / Net 30 for approved accounts" },
];

export function AuthShell({
  backHref,
  backLabel = "Back",
  showSignInPrompt = true,
  children,
}: {
  backHref?: string;
  backLabel?: string;
  showSignInPrompt?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Desktop top nav */}
      <nav className="hidden h-18 items-center justify-between border-b border-primary-200 bg-primary-50 px-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 font-serif text-[1.35rem] font-black text-neutral-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-primary-500 font-serif text-base font-black text-white">
            W
          </span>
          WeDoHalal<em className="text-primary-500 not-italic">.</em>
          <span className="rounded border border-primary-200 bg-primary-500/15 px-1.5 py-0.5 font-sans text-[0.58rem] font-extrabold tracking-wide text-primary-500 uppercase">
            Wholesale
          </span>
        </Link>
        <div className="flex items-center gap-2 text-[0.78rem] text-neutral-400">
          <Link href="/#products" className="font-semibold text-neutral-400 hover:text-neutral-900">
            Browse catalogue
          </Link>
          <span>·</span>
          <a href="mailto:help@wedohalal.com" className="font-semibold text-neutral-400 hover:text-neutral-900">
            Help
          </a>
          {showSignInPrompt && (
            <>
              <span>·</span>
              <span className="font-semibold">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-primary-500">
                  Sign in →
                </Link>
              </span>
            </>
          )}
        </div>
      </nav>

      <div className="lg:flex">
        <div className="relative hidden w-105 shrink-0 flex-col justify-between overflow-hidden bg-charcoal-900 p-14 lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute h-90 w-90 -translate-x-10 translate-y-40 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(217,64,48,0.14) 0%, transparent 65%)",
            }}
          />
          <div className="relative z-10">
            <div className="mb-2 font-serif text-2xl font-black text-white">
              WeDoHalal<span className="text-primary-500">.</span>
            </div>
            <div className="mb-12 text-[0.7rem] font-extrabold tracking-wide text-white/35 uppercase">
              Wholesale Portal
            </div>
            <h2 className="mb-3.5 font-serif text-[2rem] leading-tight font-black tracking-tight text-white">
              Bulk halal meat,
              <br />
              <em className="text-primary-500 italic">
                directly to your door.
              </em>
            </h2>
            <p className="mb-9 text-[0.84rem] leading-loose text-white/55">
              Edmonton&apos;s B2B platform for restaurants, grocery stores,
              mosques, and catering companies. Certified, fresh, and
              reliable.
            </p>
            <div className="flex flex-col gap-3">
              {TRUST_ITEMS.map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-primary-500/25 bg-primary-500/15 text-base">
                    {item.icon}
                  </div>
                  <div className="text-[0.8rem] font-semibold text-white/65">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 rounded-[10px] border border-green-600/25 bg-green-600/15 px-3.5 py-3">
            <span className="text-xl">🕌</span>
            <span className="text-[0.76rem] leading-tight text-white/65">
              <strong className="text-green-300">
                Zabiha Halal Certified
              </strong>
              <br />
              ISNA Canada Cert #ANM-2025-0042 · Verified supply chain
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="sticky top-0 z-50 border-b-[1.5px] border-neutral-200 bg-white px-4.5 py-3.5 lg:hidden">
            <div className="flex items-center justify-between">
              {backHref ? (
                <Link
                  href={backHref}
                  className="flex items-center gap-1.5 text-[0.88rem] font-bold text-primary-500"
                >
                  ← {backLabel}
                </Link>
              ) : (
                <div>
                  <div className="font-serif text-[1.3rem] font-black tracking-tight text-neutral-900">
                    WeDoHalal<span className="text-primary-500">.</span>
                  </div>
                  <div className="mt-0.5 text-[0.7rem] font-semibold text-neutral-400">
                    Wholesale Portal
                  </div>
                </div>
              )}
              <HalalBadge />
            </div>
          </div>

          <div className="mx-auto max-w-110 px-4.5 py-6 lg:max-w-115 lg:px-14 lg:py-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
