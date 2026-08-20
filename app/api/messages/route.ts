import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createThread } from "@/lib/db/queries/messages";
import { newThreadSchema } from "@/lib/validation/messages";

// Screen 29's "New message" compose screen.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = newThreadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const thread = await createThread(session.userId, parsed.data);
  return NextResponse.json({ thread: { id: thread.id } }, { status: 201 });
}
