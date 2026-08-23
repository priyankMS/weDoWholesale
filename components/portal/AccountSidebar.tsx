"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ACCOUNT_ITEMS = [
  { href: "/account", icon: "🏠", label: "Dashboard" },
  { href: "/account/orders", icon: "📦", label: "Order history" },
  { href: "/account/reorder", icon: "↩", label: "Quick reorder" },
  { href: "/account/invoices", icon: "📄", label: "Invoices & statements" },
];

const SETTINGS_ITEMS = [
  { href: "/account/addresses", icon: "📍", label: "Delivery addresses" },
  { href: "/account/payment", icon: "💳", label: "Payment methods & terms" },
  { href: "/account/notifications", icon: "🔔", label: "Notification preferences" },
  { href: "/account/profile", icon: "👤", label: "Profile & business info" },
];

// Desktop-only secondary nav for the Account section — genuinely new in
// the desktop mockup (not present at all in the mobile-only file, which
// relies on the mockup's per-screen back button instead). Doesn't replace
// the portal-wide TopNav/BottomNav (components/portal/TopNav.tsx,
// BottomNav.tsx) — this sits below it, scoped to /account/*.
export function AccountSidebar({
  businessName,
  email,
  activeOrders,
}: {
  businessName: string | null;
  email: string;
  activeOrders: number;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/account" ? pathname === "/account" : pathname.startsWith(href);
  }

  return (
    <div className="sticky top-18 hidden max-h-[calc(100vh-4.5rem)] w-65 shrink-0 overflow-y-auto border-r-[1.5px] border-neutral-200 bg-white py-6 lg:block">
      <div className="mb-4 border-b border-neutral-200 px-5 pb-5">
        <div className="mb-2.5 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-primary-200 bg-primary-50 text-[1.6rem]">
          🏪
        </div>
        <div className="mb-0.5 text-[0.95rem] font-extrabold text-neutral-900">
          {businessName ?? "Your business"}
        </div>
        <div className="text-[0.72rem] text-neutral-400">{email}</div>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.75 text-[0.66rem] font-extrabold text-green-600">
          ✓ Approved
        </div>
      </div>

      <div className="mb-2.5">
        <div className="mb-1.5 px-5 text-[0.6rem] font-extrabold tracking-widest text-neutral-400 uppercase">
          Account
        </div>
        {ACCOUNT_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 border-l-[3px] px-5 py-2.75 text-[0.82rem] font-semibold transition-colors ${
              isActive(item.href)
                ? "border-primary-500 bg-primary-50 text-primary-500"
                : "border-transparent text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            <span className="text-[1.05rem]">{item.icon}</span>
            {item.label}
            {item.href === "/account/orders" && activeOrders > 0 && (
              <span className="ml-auto rounded-full bg-primary-500 px-1.75 py-0.5 text-[0.64rem] font-extrabold text-white">
                {activeOrders}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mb-2.5">
        <div className="mb-1.5 px-5 text-[0.6rem] font-extrabold tracking-widest text-neutral-400 uppercase">
          Settings
        </div>
        {SETTINGS_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 border-l-[3px] px-5 py-2.75 text-[0.82rem] font-semibold transition-colors ${
              isActive(item.href)
                ? "border-primary-500 bg-primary-50 text-primary-500"
                : "border-transparent text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            <span className="text-[1.05rem]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
