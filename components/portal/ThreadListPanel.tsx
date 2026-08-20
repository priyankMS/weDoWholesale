"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { inboxTimeLabel, threadTagClass } from "@/lib/format";
import type { ThreadListRow } from "@/lib/db/queries/messages";

// Desktop-only middle column of /messages — the mockup's `.thread-list`
// panel (search + All/Unread tabs + thread rows). Mobile renders its own
// full-screen inbox instead (see app/(portal)/messages/page.tsx), matching
// the mockup's separate mobile "Screen 29" markup.
export function ThreadListPanel({ threads }: { threads: ThreadListRow[] }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "unread">("all");

  const unreadCount = threads.filter((t) => t.unreadCount > 0).length;

  const visible = useMemo(() => {
    return threads.filter((t) => {
      if (tab === "unread" && t.unreadCount === 0) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return t.subject.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q);
    });
  }, [threads, tab, query]);

  return (
    <div className="hidden w-75 shrink-0 flex-col border-r-[1.5px] border-neutral-200 bg-white lg:flex">
      <div className="flex items-center justify-between border-b-[1.5px] border-neutral-200 px-4.5 py-4">
        <span className="font-serif text-[1rem] font-black text-neutral-900">Inbox</span>
        <Link
          href="/messages/new"
          className="rounded-[7px] bg-primary-500 px-3 py-1.5 text-[0.72rem] font-extrabold text-white hover:bg-primary-600"
        >
          + New message
        </Link>
      </div>

      <div className="border-b border-neutral-200 px-4 py-2.5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations…"
          className="w-full rounded-lg border-[1.5px] border-neutral-200 bg-neutral-50 px-3 py-1.75 text-[0.78rem] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-500"
        />
      </div>

      <div className="flex border-b border-neutral-200">
        {(["all", "unread"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 border-b-2.5 py-2.5 text-center text-[0.72rem] font-bold -mb-px ${
              tab === t
                ? "border-primary-500 text-primary-500"
                : "border-transparent text-neutral-400"
            }`}
          >
            {t === "all" ? `All (${threads.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 && (
          <div className="px-4.5 py-8 text-center text-[0.8rem] text-neutral-400">
            No conversations here.
          </div>
        )}
        {visible.map((thread) => {
          const active = pathname === `/messages/${thread.id}`;
          return (
            <Link
              key={thread.id}
              href={`/messages/${thread.id}`}
              className={`block border-b border-neutral-200 px-4.5 py-3.5 transition-colors ${
                active
                  ? "border-l-3 border-l-primary-500 bg-primary-50"
                  : thread.unreadCount > 0
                    ? "bg-primary-50 hover:bg-primary-100"
                    : "hover:bg-neutral-50"
              }`}
            >
              <div className="mb-0.75 flex items-center justify-between gap-2">
                <span className="truncate text-[0.82rem] font-extrabold text-neutral-900">
                  {thread.subject}
                </span>
                <span className="shrink-0 text-[0.64rem] text-neutral-400">
                  {inboxTimeLabel(thread.lastMessageAt)}
                </span>
              </div>
              <div className="truncate text-[0.72rem] text-neutral-400">
                {thread.preview || "No messages yet"}
              </div>
              <div className="mt-1.25 flex items-center gap-1.5">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[0.6rem] font-extrabold ${threadTagClass(thread.tagStyle)}`}
                >
                  {thread.tagLabel}
                </span>
                {thread.unreadCount > 0 && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
