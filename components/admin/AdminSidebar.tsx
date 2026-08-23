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
    <aside className="flex h-screen w-[200px] shrink-0 flex-col overflow-hidden bg-[#0f0e0d]">
      <div className="flex items-center gap-2 border-b border-[#2a2724] px-4 py-3.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#e05a4a] text-[0.9rem]">
          🥩
        </span>
        <div className="min-w-0 leading-tight">
          <div className="font-[family-name:var(--font-plex-mono)] text-[14px] font-semibold tracking-tight text-white">
            WeDoHalal<span className="text-[#e05a4a]">.</span>
          </div>
          <div className="text-[13px] font-medium text-[#5a5450]">Master Admin v1.0</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2.5">
        {SECTIONS.map((section) => (
          <div key={section.heading} className="pt-2 pb-1">
            <div className="px-3.5 pb-1 text-[13px] font-semibold tracking-[1.5px] text-[#3a3632] uppercase">
              {section.heading}
            </div>
            <div className="flex flex-col">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 border-l-2 px-3.5 py-1.5 text-[14px] font-medium transition-colors ${
                      active
                        ? "border-[#e05a4a] bg-[#1e1c1a] text-white"
                        : "border-transparent text-[#7a7470] hover:bg-[#1e1c1a] hover:text-[#ccc]"
                    }`}
                  >
                    <span className="w-4 shrink-0 text-center text-[16px]">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-[#e05a4a] px-[6px] py-px text-[13px] font-bold text-white">
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

      <div className="mt-auto border-t border-[#2a2724] px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#e05a4a] text-[14px] font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-medium text-[#9a9490]">{name}</div>
            <div className="truncate text-[13px] text-[#5a5450]">{email}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            className="shrink-0 cursor-pointer rounded p-1 text-[#5a5450] hover:bg-[#1e1c1a] hover:text-[#ccc]"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
