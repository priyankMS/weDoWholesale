"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminLogout } from "@/lib/api/adminAuth";

type NavItem = { href: string; label: string; icon: string; badge?: string };
type NavSection = { heading: string; items: NavItem[] };

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  name,
  email,
  missingSeoCount,
  liveOrderCount,
  pendingCustomerCount,
}: {
  name: string;
  email: string;
  missingSeoCount: number;
  liveOrderCount: number;
  pendingCustomerCount: number;
}) {
  // Sections/items mirror the Dropbox mockup's sidebar (wedohalal-master-admin.html).
  const SECTIONS: NavSection[] = [
    {
      heading: "Overview",
      items: [
        { href: "/admin", label: "Dashboard", icon: "📊" },
        {
          href: "/admin/customers",
          label: "Customers",
          icon: "🧾",
          badge: pendingCustomerCount > 0 ? String(pendingCustomerCount) : undefined,
        },
      ],
    },
    {
      heading: "Catalogue",
      items: [
        { href: "/admin/products", label: "Products", icon: "🥩" },
        { href: "/admin/variants", label: "Variants & SKUs", icon: "🔀" },
        {
          href: "/admin/seo",
          label: "SEO Manager",
          icon: "🔍",
          badge: missingSeoCount > 0 ? String(missingSeoCount) : undefined,
        },
      ],
    },
    {
      heading: "Pricing",
      items: [
        { href: "/admin/pricing", label: "Price Control", icon: "💲" },
        { href: "/admin/supplier-compare", label: "Supplier Compare", icon: "⚖️" },
      ],
    },
    {
      heading: "Suppliers",
      items: [
        { href: "/admin/suppliers", label: "Suppliers", icon: "🏪" },
        {
          href: "/admin/orders",
          label: "Orders",
          icon: "📋",
          badge: liveOrderCount > 0 ? String(liveOrderCount) : undefined,
        },
      ],
    },
    { heading: "System", items: [{ href: "/admin/settings", label: "Settings", icon: "⚙️" }] },
  ];

  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await adminLogout();
      toast.success("Signed out");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("Couldn't sign out. Try again.");
    }
  }

  const initials =
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950">
      <div className="flex items-center gap-2.5 border-b border-neutral-800 px-5 py-5">
        <span className="text-2xl">🥩</span>
        <div>
          <div className="font-serif text-sm font-black text-white">WeDoHalal.</div>
          <div className="text-[0.65rem] font-bold tracking-wider text-neutral-500 uppercase">
            Master Admin v1.0
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {SECTIONS.map((section) => (
          <div key={section.heading} className="mb-5">
            <div className="mb-1.5 px-2.5 text-[0.65rem] font-extrabold tracking-widest text-neutral-600 uppercase">
              {section.heading}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.84rem] font-semibold transition-colors ${
                      active
                        ? "bg-red-600/15 text-red-500"
                        : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                    }`}
                  >
                    <span className="text-[0.95rem]">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-neutral-800 px-1.5 py-0.5 text-[0.65rem] font-bold text-neutral-400">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-neutral-800 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[0.8rem] font-bold text-white">{name}</div>
            <div className="truncate text-[0.68rem] text-neutral-500">{email}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            className="cursor-pointer rounded-md p-1.5 text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
