import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { getSeoMissingCount } from "@/lib/db/queries/adminSeo";
import { getLiveOrderCount } from "@/lib/db/queries/adminOrders";
import { getPendingCustomerCount } from "@/lib/db/queries/adminCustomers";

// Admin gets its own type system (IBM Plex) matching the client's
// wedohalal-master-admin.html mockup — deliberately distinct from the
// storefront's Fraunces/Manrope pair, scoped to this route group only via
// the wrapper below so the customer-facing site is untouched.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [missingSeoCount, liveOrderCount, pendingCustomerCount] = await Promise.all([
    getSeoMissingCount(),
    getLiveOrderCount(),
    getPendingCustomerCount(),
  ]);

  return (
    <div
      className={`${plexSans.variable} ${plexMono.variable} flex h-screen bg-[#f7f5f2] font-[family-name:var(--font-plex-sans)]`}
    >
      <AdminSidebar
        name={session.name}
        email={session.email}
        missingSeoCount={missingSeoCount}
        liveOrderCount={liveOrderCount}
        pendingCustomerCount={pendingCustomerCount}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}
