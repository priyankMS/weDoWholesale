"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartPill } from "@/components/portal/CartPill";

const NAV_LINKS = [
  { href: "/catalogue", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/saved", label: "Saved" },
  { href: "/halal-certs", label: "Halal certifications" },
  { href: "/messages", label: "Messages" },
];

export function TopNav({
  businessName,
  city,
  hasUnread = false,
}: {
  businessName: string | null;
  city: string | null;
  hasUnread?: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top nav */}
      <nav className="sticky top-0 z-60 hidden h-18 items-center justify-between border-b border-primary-200 bg-primary-50 px-12 lg:flex">
        <Link
          href="/catalogue"
          className="flex items-center gap-2.5 font-serif text-[1.35rem] font-black text-neutral-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-primary-500 font-serif text-base font-black text-white">
            W
          </span>
          WeDoHalal<em className="text-primary-500 not-italic">.</em>
          <span className="rounded border border-primary-200 bg-primary-500/15 px-1.5 py-0.5 font-sans text-[0.58rem] font-extrabold tracking-wide text-primary-500 uppercase">
            Wholesale
          </span>
        </Link>

        <div className="flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/catalogue"
                ? pathname === "/catalogue" || pathname.startsWith("/products")
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-[0.78rem] font-semibold transition-colors hover:text-neutral-900 ${
                  active ? "text-neutral-900" : "text-neutral-500"
                }`}
              >
                {link.label}
                {link.href === "/messages" && hasUnread && (
                  <span className="absolute -top-1.5 -right-2.5 h-1.75 w-1.75 rounded-full bg-primary-500" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/account"
            className="flex shrink-0 items-center gap-2 rounded-full border-[1.5px] border-primary-200 bg-white py-1.5 pr-3.5 pl-2 transition-colors hover:border-primary-500"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-[0.85rem]">
              🏪
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[0.78rem] font-bold text-neutral-900">
                {businessName ?? "Your account"}
              </span>
              {city && <span className="block text-[0.66rem] text-neutral-400">{city}</span>}
            </span>
          </Link>
          <CartPill />
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-50 border-b-[1.5px] border-neutral-200 bg-white px-4.5 py-3.5 lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-serif text-[1.3rem] font-black tracking-tight text-neutral-900">
              WeDoHalal<span className="text-primary-500">.</span>
            </div>
            <div className="mt-0.5 text-[0.7rem] font-semibold text-neutral-400">
              Wholesale{city ? ` · ${city}` : ""}
            </div>
          </div>
          <CartPill />
        </div>
      </div>
    </>
  );
}
