import { type ReactNode } from "react";
import { TopNav } from "@/components/portal/TopNav";
import { BottomNav } from "@/components/portal/BottomNav";
import { ToastProvider } from "@/components/portal/ToastProvider";

export function PortalShell({
  businessName,
  city,
  children,
}: {
  businessName: string | null;
  city: string | null;
  children: ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-neutral-50">
        <TopNav businessName={businessName} city={city} />
        <main className="mx-auto max-w-6xl pb-24 lg:pb-12">{children}</main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
