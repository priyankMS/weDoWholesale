import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { getSeoMissingCount } from "@/lib/db/queries/adminSeo";
import { getLiveOrderCount } from "@/lib/db/queries/adminOrders";
import { getPendingCustomerCount } from "@/lib/db/queries/adminCustomers";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [missingSeoCount, liveOrderCount, pendingCustomerCount] = await Promise.all([
    getSeoMissingCount(),
    getLiveOrderCount(),
    getPendingCustomerCount(),
  ]);

  return (
    <div className="flex h-screen bg-neutral-100">
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
