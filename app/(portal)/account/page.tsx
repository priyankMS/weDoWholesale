import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { User } from "@/lib/db/models/User";
import { getAccountOverview } from "@/lib/db/queries/account";
import { formatMoney, paymentTermsLabel } from "@/lib/format";
import { MenuList, MenuItem } from "@/components/portal/MenuList";
import { SignOutButton } from "@/components/auth/SignOutButton";

function StatTile({ icon, val, label }: { icon: string; val: string; label: string }) {
  return (
    <div className="rounded-xl border-[1.5px] border-neutral-200 bg-white p-3.5 lg:p-4.5">
      <div className="mb-1.5 text-[1.3rem] lg:text-[1.4rem]">{icon}</div>
      <div className="mb-0.5 font-serif text-[1.3rem] font-black text-neutral-900 lg:text-[1.5rem]">
        {val}
      </div>
      <div className="text-[0.66rem] font-semibold text-neutral-400 lg:text-[0.72rem]">
        {label}
      </div>
    </div>
  );
}

// Screen 20 — My Account Dashboard. Mobile keeps the mockup's pink hero
// banner; desktop swaps it for the plain page-header style shared with
// every other /account/* sub-page (see AccountHeader.tsx) since that's
// what the desktop mockup's own dashboard frame uses.
export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await User.findByPk(session.userId);
  if (!user) redirect("/login");

  const overview = await getAccountOverview(session.userId);

  return (
    <div className="pb-8">
      {/* Mobile hero */}
      <div className="bg-primary-500 px-5 pt-7 pb-6 text-white lg:hidden">
        <div className="mb-3 flex h-15 w-15 items-center justify-center rounded-full border-2 border-white/35 bg-white/25 text-[1.7rem]">
          🏪
        </div>
        <div className="mb-1 font-serif text-[1.3rem] font-black">
          {user.businessName ?? "Your business"}
        </div>
        <span className="inline-block rounded-full bg-white/20 px-2.75 py-0.75 text-[0.72rem] font-bold opacity-90">
          ✓ Approved Wholesale Account
        </span>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {user.city && (
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[0.7rem] font-semibold">
              📍 {user.city}
            </span>
          )}
          {user.phone && (
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[0.7rem] font-semibold">
              📱 {user.phone}
            </span>
          )}
        </div>
      </div>

      {/* Desktop header */}
      <div className="mb-5 hidden items-start justify-between pt-6 lg:flex">
        <div>
          <div className="font-serif text-[1.6rem] font-black text-neutral-900">My Account</div>
          <div className="mt-1 text-[0.82rem] text-neutral-400">
            {user.businessName} · Account ID: WDH-ACC-{String(user.id).padStart(5, "0")}
          </div>
        </div>
        <Link
          href="/catalogue"
          className="rounded-lg bg-primary-500 px-5 py-2.5 text-[0.8rem] font-extrabold text-white transition-colors hover:bg-primary-600"
        >
          Place a new order →
        </Link>
      </div>

      <div className="mt-3.5 mb-1 grid grid-cols-2 gap-2 px-4 lg:grid-cols-4 lg:gap-3.5 lg:px-0">
        <StatTile icon="📦" val={String(overview.totalOrders)} label="Total orders placed" />
        <StatTile icon="🧾" val={formatMoney(overview.lifetimeSpend)} label="Lifetime spend" />
        <StatTile
          icon="📅"
          val={paymentTermsLabel(overview.paymentTerms)}
          label="Payment terms"
        />
        <StatTile
          icon="📍"
          val={String(overview.savedAddressCount)}
          label="Saved addresses"
        />
      </div>

      <div className="px-4 pt-4 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Orders
      </div>
      <MenuList>
        <MenuItem
          href="/account/orders"
          icon="📋"
          tone="pink"
          label="Order history"
          sub="View and track all past orders"
          badge={overview.activeOrders > 0 ? `${overview.activeOrders} active` : undefined}
        />
        <MenuItem
          href="/account/reorder"
          icon="🔁"
          tone="green"
          label="Quick reorder"
          sub="Repeat a previous order in one tap"
        />
        <MenuItem
          href="/account/invoices"
          icon="🧾"
          tone="amber"
          label="Invoices and statements"
          sub="Download PDF invoices"
        />
      </MenuList>

      <div className="px-4 pt-2 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Settings
      </div>
      <MenuList>
        <MenuItem
          href="/account/addresses"
          icon="📍"
          tone="blue"
          label="Delivery addresses"
          sub={`${overview.savedAddressCount} saved address${overview.savedAddressCount === 1 ? "" : "es"}`}
        />
        <MenuItem
          href="/account/payment"
          icon="💳"
          tone="green"
          label="Payment methods and terms"
          sub={paymentTermsLabel(overview.paymentTerms)}
        />
        <MenuItem
          href="/account/notifications"
          icon="🔔"
          tone="pink"
          label="Notification preferences"
          sub="Email and WhatsApp alerts"
        />
        <MenuItem
          href="/account/profile"
          icon="✏️"
          tone="gray"
          label="Business profile"
          sub="Edit business info and contact"
        />
      </MenuList>

      <div className="px-4 pt-2 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Support
      </div>
      <MenuList>
        <MenuItem
          href="https://wa.me/17807227623"
          external
          icon="💬"
          tone="green"
          label="WhatsApp support"
          sub="Fastest response · 9 AM – 7 PM"
        />
        <MenuItem
          href="mailto:help@wedohalal.com"
          icon="✉️"
          tone="blue"
          label="Email us"
          sub="help@wedohalal.com"
        />
      </MenuList>

      <div className="px-4 pt-2 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Legal
      </div>
      <MenuList>
        <MenuItem
          href="/legal/terms"
          icon="⚖️"
          tone="gray"
          label="Terms and conditions"
          sub="Wholesale account terms"
        />
        <MenuItem
          href="/legal/privacy"
          icon="🔒"
          tone="blue"
          label="Privacy policy"
          sub="How we handle your data"
        />
        <MenuItem
          href="/legal/delivery"
          icon="🚚"
          tone="green"
          label="Delivery policy"
          sub="Areas, schedules and rates"
        />
      </MenuList>

      <div className="px-4 pt-1 lg:px-0 lg:max-w-70">
        <SignOutButton />
      </div>
    </div>
  );
}
