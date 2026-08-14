import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";
import { User } from "@/lib/db/models/User";
import { PortalShell } from "@/components/portal/PortalShell";

// Phase 2 (Discovery and Browsing) is gated to signed-in, approved
// wholesale accounts only — mirrors the redirect pattern in
// app/(auth)/pending/page.tsx. This layout applies to every route inside
// the (portal) group (catalogue, products, search, saved, halal-certs,
// account), so it's typed against plain ReactNode rather than a single
// route's generated LayoutProps.
export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await User.findByPk(session.userId);
  if (!user) redirect("/login");
  if (user.status !== "approved") redirect("/pending");

  return (
    <PortalShell businessName={user.businessName} city={user.city}>
      {children}
    </PortalShell>
  );
}
