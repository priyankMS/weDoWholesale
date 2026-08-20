import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getThread } from "@/lib/db/queries/messages";
import { ThreadChat } from "@/components/portal/ThreadChat";

// Screen 29 — message thread / chat view.
export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const threadId = Number(id);
  if (!Number.isInteger(threadId)) notFound();

  const thread = await getThread(session.userId, threadId);
  if (!thread) notFound();

  return (
    <ThreadChat
      threadId={thread.id}
      subject={thread.subject}
      orderNumber={thread.orderNumber}
      avatarKind={thread.avatarKind}
      tagLabel={thread.tagLabel}
      tagStyle={thread.tagStyle}
      initialMessages={thread.messages}
    />
  );
}
