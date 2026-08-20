import { type ReactNode } from "react";
import { TopNav } from "@/components/portal/TopNav";
import { BottomNav } from "@/components/portal/BottomNav";
import { PortalFooter } from "@/components/portal/PortalFooter";
import { ToastProvider } from "@/components/portal/ToastProvider";
import { CartProvider } from "@/lib/cart/CartContext";

export function PortalShell({
  businessName,
  city,
  hasUnreadMessages = false,
  children,
}: {
  businessName: string | null;
  city: string | null;
  hasUnreadMessages?: boolean;
  children: ReactNode;
}) {
  return (
    <ToastProvider>
      <CartProvider>
        <div className="min-h-screen bg-neutral-50">
          <TopNav businessName={businessName} city={city} hasUnread={hasUnreadMessages} />
          <main className="mx-auto flex max-w-6xl flex-col pb-24 lg:h-[calc(100vh-4.5rem)] lg:overflow-y-auto lg:pb-12">
            <div className="flex-1">{children}</div>
            <PortalFooter />
          </main>
          <BottomNav hasUnread={hasUnreadMessages} />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
