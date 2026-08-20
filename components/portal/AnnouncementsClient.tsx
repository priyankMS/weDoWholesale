"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/portal/ToastProvider";
import { getApiErrorMessage } from "@/lib/api/error";
import { markAllAnnouncementsRead } from "@/lib/api/announcements";
import { announcementTagClass, formatDate, type AnnouncementTag } from "@/lib/format";
import type { AnnouncementRow } from "@/lib/db/queries/announcements";

const FILTERS: { value: "all" | AnnouncementTag; label: string }[] = [
  { value: "all", label: "All" },
  { value: "eid", label: "Eid specials" },
  { value: "pricing", label: "Pricing" },
  { value: "newprod", label: "New products" },
  { value: "ops", label: "Operations" },
];

// Screen 31 — Announcements / noticeboard.
export function AnnouncementsClient({ initial }: { initial: AnnouncementRow[] }) {
  const showToast = useToast();
  const [announcements, setAnnouncements] = useState(initial);
  const [filter, setFilter] = useState<"all" | AnnouncementTag>("all");
  const [marking, setMarking] = useState(false);

  const unreadCount = announcements.filter((a) => !a.read).length;
  const visible = useMemo(
    () => announcements.filter((a) => filter === "all" || a.tag === filter),
    [announcements, filter],
  );

  async function handleMarkAllRead() {
    if (marking || unreadCount === 0) return;
    setMarking(true);
    try {
      await markAllAnnouncementsRead();
      setAnnouncements((prev) => prev.map((a) => ({ ...a, read: true })));
      showToast("All announcements marked as read");
    } catch (err) {
      showToast(getApiErrorMessage(err));
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="pb-8">
      <div className="border-b-[1.5px] border-neutral-200 bg-white px-4.5 py-3.5 lg:px-6 lg:py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-serif text-[1.2rem] font-bold text-neutral-900 lg:text-[1.4rem] lg:font-black">
              Announcements
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={marking}
              className="text-[0.8rem] font-bold text-primary-500 disabled:opacity-50"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1.75 overflow-x-auto px-4 py-3 lg:px-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-full border-[1.5px] px-3.5 py-1.75 text-[0.78rem] font-semibold whitespace-nowrap ${
              filter === f.value
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-neutral-200 bg-white text-neutral-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-1 text-[0.74rem] font-medium text-neutral-400 lg:px-6">
        {unreadCount} unread announcement{unreadCount === 1 ? "" : "s"}
      </div>

      <div className="flex flex-col gap-2.5 px-4 pt-2.5 lg:grid lg:grid-cols-2 lg:gap-3.5 lg:px-6">
        {visible.map((a) => (
          <div
            key={a.id}
            className={`overflow-hidden rounded-2xl border-[1.5px] bg-white ${
              a.pinned ? "border-primary-500" : "border-neutral-200"
            }`}
          >
            <div className="px-4 pt-3.5 pb-2.5">
              <div className="mb-2 flex flex-wrap items-center gap-1.75">
                {a.pinned && (
                  <span className="rounded-md bg-primary-500 px-2 py-0.75 text-[0.62rem] font-extrabold text-white">
                    📌 Pinned
                  </span>
                )}
                <span
                  className={`rounded-md border px-2 py-0.75 text-[0.62rem] font-extrabold ${announcementTagClass(a.tag)}`}
                >
                  {a.tagLabel}
                </span>
                {!a.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
                <span className="ml-auto shrink-0 text-[0.68rem] font-medium text-neutral-400">
                  {formatDate(a.publishedAt)}
                </span>
              </div>
              <div className="mb-1.5 font-serif text-[1.05rem] font-bold text-neutral-900">
                {a.title}
              </div>
              <div className="text-[0.82rem] leading-relaxed text-neutral-700">{a.body}</div>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2.5">
              {a.ctaLabel && a.ctaHref ? (
                <a href={a.ctaHref} className="text-[0.78rem] font-extrabold text-primary-500">
                  {a.ctaLabel}
                </a>
              ) : (
                <span />
              )}
              <span className="text-[0.68rem] font-medium text-neutral-400">
                {a.read ? "Read" : "Unread"}
              </span>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="col-span-2 px-4 py-10 text-center text-[0.82rem] text-neutral-400">
            No announcements in this category.
          </div>
        )}
      </div>
    </div>
  );
}
