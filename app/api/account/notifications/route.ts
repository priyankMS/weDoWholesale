import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { NotificationPreference } from "@/lib/db/models/NotificationPreference";
import { getNotificationPreferences } from "@/lib/db/queries/account";
import { notificationPreferencesSchema } from "@/lib/validation/account";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const prefs = await getNotificationPreferences(session.userId);
  return NextResponse.json({ preferences: prefs });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = notificationPreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const [prefs] = await NotificationPreference.findOrCreate({
    where: { userId: session.userId },
    defaults: { userId: session.userId, ...parsed.data },
  });
  await prefs.update(parsed.data);

  return NextResponse.json({ preferences: prefs });
}
