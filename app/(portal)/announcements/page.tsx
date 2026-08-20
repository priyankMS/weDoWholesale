import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listAnnouncements } from "@/lib/db/queries/announcements";
import { AnnouncementsClient } from "@/components/portal/AnnouncementsClient";

// Screen 31 — Announcements / noticeboard.
export default async function AnnouncementsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const announcements = await listAnnouncements(session.userId);

  return <AnnouncementsClient initial={announcements} />;
}
