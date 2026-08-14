"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/catalogue", icon: "🏠", label: "Home" },
  { href: "/search", icon: "🔍", label: "Search" },
  { href: "/saved", icon: "♡", label: "Saved" },
  { href: "/halal-certs", icon: "✓", label: "Halal" },
  { href: "/account", icon: "👤", label: "Account" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-60 flex border-t-[1.5px] border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/catalogue"
            ? pathname === "/catalogue" || pathname.startsWith("/products")
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.75 px-1 py-2.5 pb-2 text-[0.63rem] font-bold ${
              active ? "text-primary-500" : "text-neutral-400"
            }`}
          >
            <span className="text-[1.25rem] leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
