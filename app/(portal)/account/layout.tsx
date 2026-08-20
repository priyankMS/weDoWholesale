import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";
import { User } from "@/lib/db/models/User";
import { getAccountOverview } from "@/lib/db/queries/account";
import { AccountSidebar } from "@/components/portal/AccountSidebar";

// Wraps every /account/* route with the desktop sidebar nav introduced in
// the Phase 4 desktop mockup (see AccountSidebar.tsx) — mobile screens
// keep using each page's own AccountHeader back-link instead, matching the
// mobile-only mockup's per-screen topbar.
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await User.findByPk(session.userId);
  if (!user) redirect("/login");

  const overview = await getAccountOverview(session.userId);

  return (
    <div className="lg:flex lg:items-start">
      <AccountSidebar
        businessName={user.businessName}
        email={user.email}
        activeOrders={overview.activeOrders}
      />
      <div className="lg:min-w-0 lg:flex-1 lg:px-8 lg:pb-10">{children}</div>
    </div>
  );
}
