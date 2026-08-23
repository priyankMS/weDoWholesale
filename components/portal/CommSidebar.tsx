"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const COMM_ITEMS = [
  { href: "/messages", icon: "💬", label: "Messages" },
  { href: "/announcements", icon: "📢", label: "Announcements" },
  { href: "/support", icon: "📞", label: "Contact support" },
];

const QUICK_LINKS = [
  { href: "/account", icon: "🏠", label: "Dashboard" },
  { href: "/account/orders", icon: "📦", label: "Orders" },
  { href: "/catalogue", icon: "🛒", label: "Browse catalogue" },
];

// Desktop-only nav rail for /messages, /announcements and /support —
// genuinely new in the Phase 5 desktop mockup (its dark ".comm-sidebar",
// distinct from the light AccountSidebar used under /account). Doesn't
// replace the portal-wide TopNav/BottomNav — sits below it, scoped to
// these three sections.
export function CommSidebar({
  unreadMessages,
  unreadAnnouncements,
}: {
  unreadMessages: number;
  unreadAnnouncements: number;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="sticky top-0 hidden h-[calc(100vh-4.5rem)] w-50 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-charcoal-900 py-5 lg:flex">
      <div className="mb-4 border-b border-white/10 px-4 pb-4.5">
        <div className="font-serif text-[1rem] font-black text-white">
          WeDoHalal<span className="text-primary-500">.</span>
        </div>
        <div className="mt-0.5 text-[0.64rem] font-semibold text-white/35">
          Wholesale Portal
        </div>
      </div>

      {COMM_ITEMS.map((item) => {
        const badge =
          item.href === "/messages"
            ? unreadMessages
            : item.href === "/announcements"
              ? unreadAnnouncements
              : 0;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-2.5 px-4 py-2.75 text-[0.8rem] font-bold transition-colors ${
              active
                ? "bg-primary-500/10 text-white"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            {active && (
              <span className="absolute inset-y-0 left-0 w-0.75 bg-primary-500" />
            )}
            <span className="text-[1rem]">{item.icon}</span>
            {item.label}
            {badge > 0 && (
              <span className="ml-auto rounded-full bg-primary-500 px-1.75 py-0.5 text-[0.62rem] font-extrabold text-white">
                {badge}
              </span>
            )}
          </Link>
        );
      })}

      <div className="my-3 h-px bg-white/10" />

      {QUICK_LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-2.5 px-4 py-2.75 text-[0.8rem] font-bold text-white/50 transition-colors hover:bg-white/5 hover:text-white"
        >
          <span className="text-[1rem]">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </div>
  );
}
