import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";
import { listThreads } from "@/lib/db/queries/messages";
import { unreadAnnouncementCount } from "@/lib/db/queries/announcements";
import { CommSidebar } from "@/components/portal/CommSidebar";
import { ThreadListPanel } from "@/components/portal/ThreadListPanel";

// Wraps /messages, /messages/[id] and /messages/new with the desktop
// 3-column layout introduced by the Phase 5 desktop mockup (dark nav rail
// + thread list + thread content) — mobile screens render their own
// full-screen views instead (see each page's own markup), matching the
// mockup's separate mobile "Screen 29" per-screen structure. Same
// sidebar-in-layout pattern as app/(portal)/account/layout.tsx.
export default async function MessagesLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [threads, unreadAnnouncements] = await Promise.all([
    listThreads(session.userId),
    unreadAnnouncementCount(session.userId),
  ]);
  const unreadMessages = threads.filter((t) => t.unreadCount > 0).length;

  return (
    <div className="lg:flex lg:h-[calc(100vh-4.5rem)] lg:items-stretch lg:overflow-hidden">
      <CommSidebar unreadMessages={unreadMessages} unreadAnnouncements={unreadAnnouncements} />
      <ThreadListPanel threads={threads} />
      <div className="lg:min-w-0 lg:flex-1 lg:overflow-y-auto">{children}</div>
    </div>
  );
}
