import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { markAllAnnouncementsRead } from "@/lib/db/queries/announcements";

// Screen 31's "Mark all read" action.
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  await markAllAnnouncementsRead(session.userId);
  return NextResponse.json({ ok: true });
}
