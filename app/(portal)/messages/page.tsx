import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listThreads } from "@/lib/db/queries/messages";
import { inboxTimeLabel, threadTagClass } from "@/lib/format";

// Screen 29 — Inbox. Mobile renders the mockup's full-screen thread list
// (topbar + unread banner + thread cards + WhatsApp nudge); desktop
// already shows the thread list in the shared layout's middle column (see
// app/(portal)/messages/layout.tsx), so this pane just prompts the user to
// pick a conversation, matching the mockup's desktop preview having no
// standalone "inbox" pane of its own.
export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const threads = await listThreads(session.userId);
  const unreadCount = threads.filter((t) => t.unreadCount > 0).length;

  return (
    <>
      {/* Desktop — right pane empty state (thread list already visible to the left) */}
      <div className="hidden h-full flex-col items-center justify-center gap-2 text-center lg:flex">
        <div className="text-[2.5rem]">💬</div>
        <div className="font-serif text-[1.05rem] font-bold text-neutral-900">
          Select a conversation
        </div>
        <div className="max-w-70 text-[0.82rem] text-neutral-400">
          Pick a thread from the list, or start a new message to the WeDoHalal team.
        </div>
        <Link
          href="/messages/new"
          className="mt-2 rounded-lg bg-primary-500 px-4 py-2 text-[0.8rem] font-extrabold text-white hover:bg-primary-600"
        >
          + New message
        </Link>
      </div>

      {/* Mobile — full inbox screen */}
      <div className="pb-6 lg:hidden">
        <div className="border-b-[1.5px] border-neutral-200 bg-white px-4.5 py-3.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-serif text-[1.3rem] font-black text-neutral-900">
                WeDoHalal<span className="text-primary-500">.</span>
              </div>
              <div className="mt-0.5 text-[0.7rem] font-semibold text-neutral-400">Inbox</div>
            </div>
            <Link href="/messages/new" className="text-[0.82rem] font-bold text-primary-500">
              + New message
            </Link>
          </div>
        </div>

        {unreadCount > 0 && (
          <div className="flex items-center gap-2.25 border-b-[1.5px] border-primary-200 bg-primary-50 px-4.5 py-2.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />
            <span className="text-[0.78rem] font-bold text-primary-600">
              {unreadCount} unread message{unreadCount === 1 ? "" : "s"}
            </span>
          </div>
        )}

        <div className="px-4 pt-4 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
          Recent conversations
        </div>

        <div className="mx-4 mb-3.5 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/messages/${thread.id}`}
              className={`flex items-start gap-3 px-4 py-3.5 ${
                thread.unreadCount > 0 ? "bg-primary-50" : ""
              }`}
            >
              <div
                className={`flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-full text-[1.1rem] font-extrabold ${
                  thread.avatarKind === "staff"
                    ? "bg-primary-500 text-white"
                    : "border-[1.5px] border-green-200 bg-green-50 text-green-600"
                }`}
              >
                {thread.avatarKind === "staff" ? "W" : (thread.icon ?? "🔔")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <span className="text-[0.88rem] font-extrabold text-neutral-900">
                    {thread.avatarKind === "staff" ? "WeDoHalal Team" : thread.subject}
                  </span>
                  <span
                    className={`shrink-0 rounded-md border px-1.75 py-0.25 text-[0.62rem] font-bold ${threadTagClass(thread.tagStyle)}`}
                  >
                    {thread.tagLabel}
                  </span>
                </div>
                <div
                  className={`truncate text-[0.76rem] leading-relaxed ${
                    thread.previewBold ? "font-bold text-neutral-700" : "text-neutral-400"
                  }`}
                >
                  {thread.preview || "No messages yet"}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[0.66rem] font-medium text-neutral-400">
                  {inboxTimeLabel(thread.lastMessageAt)}
                </span>
                {thread.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-[0.66rem] font-extrabold text-white">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mx-4 flex items-center gap-3 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4">
          <div className="shrink-0 text-[1.5rem]">💬</div>
          <div className="flex-1">
            <div className="mb-0.5 text-[0.86rem] font-extrabold text-neutral-900">
              Prefer WhatsApp?
            </div>
            <div className="text-[0.76rem] leading-relaxed text-neutral-700">
              Most of our team responds fastest on WhatsApp. Tap to message us directly.
            </div>
          </div>
          <a
            href="https://wa.me/17807227623"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-[9px] bg-[#25D366] px-3 py-2 text-[0.76rem] font-extrabold text-white"
          >
            Open
          </a>
        </div>
      </div>
    </>
  );
}
