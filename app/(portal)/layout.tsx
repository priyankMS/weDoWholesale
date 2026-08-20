import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";
import { User } from "@/lib/db/models/User";
import { unreadThreadCount } from "@/lib/db/queries/messages";
import { PortalShell } from "@/components/portal/PortalShell";

// Phase 2 (Discovery and Browsing) is gated to signed-in wholesale
// accounts only — approval status no longer blocks access. This layout
// applies to every route inside the (portal) group (catalogue, products,
// search, saved, halal-certs, account, messages, announcements, support),
// so it's typed against plain ReactNode rather than a single route's
// generated LayoutProps.
export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await User.findByPk(session.userId);
  if (!user) redirect("/login");

  // Phase 5 (Communication) — Screen 29's `.nav-unread` dot on the Inbox
  // tab. Computed here (not inside BottomNav/TopNav, which are client
  // components) so every route gets it without an extra client-side fetch.
  const unreadCount = await unreadThreadCount(session.userId);

  return (
    <PortalShell
      businessName={user.businessName}
      city={user.city}
      hasUnreadMessages={unreadCount > 0}
    >
      {children}
    </PortalShell>
  );
}
