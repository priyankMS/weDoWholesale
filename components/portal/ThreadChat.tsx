"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useToast } from "@/components/portal/ToastProvider";
import { getApiErrorMessage } from "@/lib/api/error";
import { replyToThread } from "@/lib/api/messages";
import { threadTagClass, type MessageThreadTagStyle } from "@/lib/format";
import type { ThreadMessageRow } from "@/lib/db/queries/messages";

type LocalMessage = {
  id: number | string;
  senderType: "customer" | "staff" | "system";
  senderName: string | null;
  body: string;
  createdAt: string;
};

function bubbleTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
}

// Screen 29's message thread / chat view — shared between the mobile
// full-screen thread and the desktop right-hand pane (see
// app/(portal)/messages/[id]/page.tsx), same dual-render approach as
// AccountHeader.tsx.
export function ThreadChat({
  threadId,
  subject,
  orderNumber,
  avatarKind,
  tagLabel,
  tagStyle,
  initialMessages,
}: {
  threadId: number;
  subject: string;
  orderNumber: string | null;
  avatarKind: "staff" | "system";
  tagLabel: string;
  tagStyle: MessageThreadTagStyle;
  initialMessages: ThreadMessageRow[];
}) {
  const showToast = useToast();
  const [messages, setMessages] = useState<LocalMessage[]>(
    // `createdAt` arrives from the server as either a Date instance or an
    // already-serialized ISO string, depending on the RSC payload — accept
    // either.
    initialMessages.map((m) => ({
      ...m,
      createdAt:
        typeof m.createdAt === "string" ? m.createdAt : new Date(m.createdAt).toISOString(),
    })),
  );
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  async function handleSend() {
    const body = draft.trim();
    if (!body || sending) return;
    setDraft("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, senderType: "customer", senderName: null, body, createdAt: new Date().toISOString() },
    ]);
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });

    try {
      const { staffMessage } = await replyToThread(threadId, { body });
      setMessages((prev) => [
        ...prev,
        {
          id: staffMessage.id,
          senderType: "staff",
          senderName: staffMessage.senderName,
          body: staffMessage.body,
          createdAt: staffMessage.createdAt,
        },
      ]);
      setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    } catch (err) {
      showToast(getApiErrorMessage(err, "Couldn't send that message"));
    } finally {
      setSending(false);
    }
  }

  const header = (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-extrabold ${
            avatarKind === "staff"
              ? "bg-primary-500 text-white"
              : "border-[1.5px] border-green-200 bg-green-50 text-green-600"
          }`}
        >
          {avatarKind === "staff" ? "W" : "🔔"}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[0.9rem] font-extrabold text-neutral-900">
            {avatarKind === "staff" ? "WeDoHalal Team" : subject}
          </div>
          <div className="truncate text-[0.66rem] font-semibold text-neutral-400">{subject}</div>
        </div>
      </div>
    </div>
  );

  const bubbles = (
    <>
      {orderNumber && (
        <Link
          href="/account/orders"
          className="mx-4 mt-2.5 mb-1.5 flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-neutral-200 bg-white px-3.25 py-2.75 hover:bg-neutral-50 lg:mx-0"
        >
          <span className="text-[1.15rem]">📦</span>
          <div className="min-w-0 flex-1">
            <div className="text-[0.82rem] font-extrabold text-neutral-900">
              Order #{orderNumber}
            </div>
            <div className="text-[0.7rem] text-neutral-400">View order details</div>
          </div>
          <span className="text-primary-500">›</span>
        </Link>
      )}

      {messages.length === 0 && (
        <div className="px-4 py-8 text-center text-[0.8rem] text-neutral-400">
          No messages yet — say hello.
        </div>
      )}

      <div className="flex flex-col gap-1.5 px-4 py-3 lg:px-0">
        {messages.map((m) => {
          const mine = m.senderType === "customer";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.25 py-2.5 text-[0.85rem] leading-relaxed ${
                  mine
                    ? "rounded-tr-[4px] bg-primary-500 text-white"
                    : "rounded-tl-[4px] border-[1.5px] border-neutral-200 bg-white text-neutral-900"
                }`}
              >
                {!mine && m.senderName && (
                  <div className="mb-0.75 text-[0.68rem] font-extrabold text-primary-500">
                    {m.senderName}
                  </div>
                )}
                {m.body}
                <div
                  className={`mt-1 text-[0.62rem] ${mine ? "text-right text-white/70" : "text-neutral-400"}`}
                >
                  {bubbleTime(m.createdAt)}
                  {mine ? " ✓✓" : ""}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={listEndRef} />
      </div>
    </>
  );

  const composer = (
    <div className="flex items-end gap-2.25">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        rows={1}
        placeholder="Type a message…"
        className="max-h-27.5 min-h-10.5 flex-1 resize-none rounded-[22px] border-[1.5px] border-neutral-200 px-4 py-2.5 text-[0.9rem] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-500"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={sending || !draft.trim()}
        className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-[1.1rem] text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
      >
        ➤
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile — full-screen thread */}
      <div className="pb-24 lg:hidden">
        <div className="sticky top-0 z-40 border-b-[1.5px] border-neutral-200 bg-white px-4.5 py-3">
          <Link href="/messages" className="text-[0.86rem] font-bold text-primary-500">
            ← Inbox
          </Link>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            {header}
            <span
              className={`shrink-0 rounded-full border px-2.5 py-0.75 text-[0.66rem] font-bold ${threadTagClass(tagStyle)}`}
            >
              {tagLabel}
            </span>
          </div>
        </div>

        {bubbles}

        <div className="fixed inset-x-0 bottom-0 z-50 border-t-[1.5px] border-neutral-200 bg-white px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
          {composer}
        </div>
      </div>

      {/* Desktop — right-hand pane within /messages layout */}
      <div className="hidden h-full flex-col lg:flex">
        <div className="flex items-center justify-between border-b-[1.5px] border-neutral-200 bg-white px-6 py-4">
          {header}
          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.75 text-[0.68rem] font-bold ${threadTagClass(tagStyle)}`}
          >
            {tagLabel}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto bg-neutral-50 px-6 py-4">{bubbles}</div>
        <div className="border-t-[1.5px] border-neutral-200 bg-white px-6 py-3.5">{composer}</div>
      </div>
    </>
  );
}
