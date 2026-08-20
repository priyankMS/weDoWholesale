"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { UtilityTopbar } from "@/components/ui/UtilityTopbar";

// Phase 8 (Utility and Error) — Screen 42, global 404. Doubles as
// Next.js's app-wide `not-found.js` (renders for both `notFound()` calls
// inside route segments and any URL that doesn't match a route at all).
// Deliberately outside the (portal) route group / PortalShell so it works
// for signed-out visitors too — the mockup's `.mini-topbar` has no account
// state, and the desktop preview frame's extra nav links ("Browse
// catalogue" / "My account") are plain links, not session-aware.

const QUICK_LINKS = [
  { icon: "🏠", label: "Home", sub: "Your dashboard", href: "/catalogue" },
  { icon: "🛍", label: "Shop", sub: "Browse all products", href: "/search" },
  { icon: "📋", label: "Order history", sub: "All past orders", href: "/account/orders" },
  { icon: "💬", label: "Support", sub: "Get help fast", href: "/support" },
];

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const waHref = `https://wa.me/17807227623?text=${encodeURIComponent(
    `Hi, I found a broken link on the wholesale portal: ${pathname}`,
  )}`;

  return (
    <div className="bg-neutral-50 lg:min-h-screen">
      <UtilityTopbar
        subtitle="Wholesale Portal"
        links={[
          { href: "/catalogue", label: "Browse catalogue" },
          { href: "/account", label: "My account" },
        ]}
      />

      <div className="mx-auto max-w-160 lg:py-10">
        {/* Illustration */}
        <div className="flex justify-center pt-9 pb-2 lg:pt-4">
          <svg width="200" height="170" viewBox="0 0 200 170" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text
              x="100"
              y="105"
              fontFamily="Georgia,serif"
              fontSize="90"
              fontWeight="900"
              fill="#eeecea"
              textAnchor="middle"
              letterSpacing="-6"
            >
              404
            </text>

            {/* Confused meat cleaver */}
            <rect x="118" y="54" width="46" height="18" rx="6" fill="#dedad4" />
            <rect x="120" y="57" width="42" height="12" rx="4" fill="#c8c4bc" />
            <path d="M72 34 L120 54 L120 72 L60 92 Z" fill="#d94030" opacity="0.85" />
            <path d="M72 34 L120 54 L114 60 L66 42 Z" fill="#b53328" opacity="0.6" />
            <line x1="60" y1="92" x2="72" y2="34" stroke="white" strokeWidth="1.5" opacity="0.35" />

            {/* Bone, crossed out */}
            <ellipse cx="42" cy="130" rx="10" ry="6" fill="#dedad4" transform="rotate(-20 42 130)" />
            <rect
              x="38"
              y="118"
              width="8"
              height="22"
              rx="4"
              fill="#dedad4"
              transform="rotate(-20 42 130)"
            />
            <ellipse cx="42" cy="148" rx="10" ry="6" fill="#dedad4" transform="rotate(-20 42 130)" />
            <line
              x1="28"
              y1="120"
              x2="56"
              y2="148"
              stroke="#d94030"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
            <line
              x1="56"
              y1="120"
              x2="28"
              y2="148"
              stroke="#d94030"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />

            <text x="155" y="46" fontFamily="Georgia,serif" fontSize="32" fontWeight="900" fill="#d94030" opacity="0.7">
              ?
            </text>

            <path
              d="M148 108 Q158 98 168 108 Q178 118 168 128 Q158 138 148 128 Q138 118 148 108 Z"
              fill="#d94030"
              opacity="0.15"
            />
            <path
              d="M152 112 Q158 106 164 112 Q170 118 164 124 Q158 130 152 124 Q146 118 152 112 Z"
              fill="#d94030"
              opacity="0.25"
            />
          </svg>
        </div>

        {/* Text */}
        <div className="mx-auto max-w-100 px-7 pb-6 text-center">
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-primary-200 bg-primary-50 px-3 py-1.25 text-[0.72rem] font-extrabold text-primary-600">
            Error 404 — Page not found
          </div>
          <div className="mb-2 font-serif text-[1.5rem] leading-tight font-black text-neutral-900 lg:text-[1.8rem]">
            Nothing here but bones
          </div>
          <div className="text-[0.84rem] leading-relaxed text-neutral-500 lg:text-[0.88rem]">
            The page you&rsquo;re looking for doesn&rsquo;t exist, was moved, or the link is broken. Try
            searching for what you need, or head back to the portal.
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mx-4 mb-2.5 lg:mx-auto lg:max-w-100">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, orders, or pages…"
              className="w-full rounded-xl border-[1.5px] border-neutral-200 bg-white py-3.25 pr-13 pl-4.5 text-[0.9rem] text-neutral-900 outline-none focus:border-primary-500"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute top-1/2 right-3.5 flex h-7.5 w-7.5 -translate-y-1/2 items-center justify-center rounded-lg bg-primary-500 text-white"
            >
              →
            </button>
          </div>
        </form>

        <div className="px-4.5 pt-2 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0 lg:text-center">
          Where do you want to go?
        </div>
        <div className="mx-4 mb-3 grid grid-cols-2 gap-2 lg:mx-auto lg:max-w-140 lg:grid-cols-4">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className="rounded-xl border-[1.5px] border-neutral-200 bg-white p-4 text-left transition-colors hover:border-primary-500 hover:bg-primary-50"
            >
              <div className="mb-2 text-[1.6rem]">{q.icon}</div>
              <div className="mb-0.5 text-[0.82rem] font-extrabold text-neutral-900">{q.label}</div>
              <div className="text-[0.68rem] text-neutral-400">{q.sub}</div>
            </Link>
          ))}
        </div>

        <div className="mx-4 flex flex-col gap-2 pb-6 lg:mx-auto lg:max-w-100">
          <Button onClick={() => router.push("/catalogue")}>← Back to portal home</Button>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-4 text-[0.92rem] font-extrabold text-white transition-colors hover:bg-[#1aad55]"
          >
            💬 Report a broken link
          </a>
        </div>
      </div>
    </div>
  );
}
