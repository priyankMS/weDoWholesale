import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";
import { unreadThreadCount } from "@/lib/db/queries/messages";
import { unreadAnnouncementCount } from "@/lib/db/queries/announcements";
import { CommSidebar } from "@/components/portal/CommSidebar";

// Same dark nav-rail wrapper as app/(portal)/messages/layout.tsx.
export default async function SupportLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [unreadMessages, unreadAnnouncements] = await Promise.all([
    unreadThreadCount(session.userId),
    unreadAnnouncementCount(session.userId),
  ]);

  return (
    <div className="lg:flex lg:items-start">
      <CommSidebar unreadMessages={unreadMessages} unreadAnnouncements={unreadAnnouncements} />
      <div className="lg:min-w-0 lg:flex-1">{children}</div>
    </div>
  );
}
