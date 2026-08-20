import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { replyToThread } from "@/lib/db/queries/messages";
import { replyMessageSchema } from "@/lib/validation/messages";

// Screen 29's chat input bar within a thread.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const threadId = Number(id);
  if (!Number.isInteger(threadId)) {
    return NextResponse.json({ error: "Invalid thread" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = replyMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const result = await replyToThread(session.userId, threadId, parsed.data.body);
  if (!result) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json(result, { status: 201 });
}
