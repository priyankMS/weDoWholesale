import { Announcement, type AnnouncementTag } from "@/lib/db/models/Announcement";
import { AnnouncementRead } from "@/lib/db/models/AnnouncementRead";

export type AnnouncementRow = {
  id: number;
  title: string;
  body: string;
  tag: AnnouncementTag;
  tagLabel: string;
  pinned: boolean;
  ctaLabel: string | null;
  ctaHref: string | null;
  publishedAt: Date;
  read: boolean;
};

export async function listAnnouncements(userId: number): Promise<AnnouncementRow[]> {
  const [announcements, reads] = await Promise.all([
    Announcement.findAll({
      order: [
        ["pinned", "DESC"],
        ["publishedAt", "DESC"],
      ],
    }),
    AnnouncementRead.findAll({ where: { userId }, attributes: ["announcementId"] }),
  ]);

  const readIds = new Set(reads.map((r) => r.announcementId));

  return announcements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    tag: a.tag,
    tagLabel: a.tagLabel,
    pinned: a.pinned,
    ctaLabel: a.ctaLabel,
    ctaHref: a.ctaHref,
    publishedAt: a.publishedAt,
    read: readIds.has(a.id),
  }));
}

export async function markAllAnnouncementsRead(userId: number): Promise<void> {
  const announcements = await Announcement.findAll({ attributes: ["id"] });
  const existingReads = await AnnouncementRead.findAll({
    where: { userId, announcementId: announcements.map((a) => a.id) },
    attributes: ["announcementId"],
  });
  const alreadyRead = new Set(existingReads.map((r) => r.announcementId));
  const toCreate = announcements
    .filter((a) => !alreadyRead.has(a.id))
    .map((a) => ({ userId, announcementId: a.id, readAt: new Date() }));

  if (toCreate.length > 0) {
    await AnnouncementRead.bulkCreate(toCreate);
  }
}

export async function unreadAnnouncementCount(userId: number): Promise<number> {
  const [total, reads] = await Promise.all([
    Announcement.count(),
    AnnouncementRead.count({ where: { userId } }),
  ]);
  return Math.max(0, total - reads);
}
