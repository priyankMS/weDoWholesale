import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

export type AnnouncementTag = "eid" | "pricing" | "newprod" | "ops";

// Phase 5 (Communication) — Screen 31 (Announcements / noticeboard).
// Platform-wide (not per user) — every wholesale account sees the same
// feed; per-user read state lives in AnnouncementRead. Seeded with the
// mockup's 5 example notices (see
// lib/db/seeders/20260819180000-seed-announcements.js) since there's no
// admin-side authoring UI yet (out of scope for this phase — the admin
// panel is being built separately).
export class Announcement extends Model<
  InferAttributes<Announcement>,
  InferCreationAttributes<Announcement>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare body: string;
  declare tag: AnnouncementTag;
  declare tagLabel: string;
  declare pinned: CreationOptional<boolean>;
  declare ctaLabel: string | null;
  declare ctaHref: string | null;
  declare publishedAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Announcement.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    tag: {
      type: DataTypes.ENUM("eid", "pricing", "newprod", "ops"),
      allowNull: false,
    },
    tagLabel: { type: DataTypes.STRING(40), allowNull: false, field: "tag_label" },
    pinned: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    ctaLabel: { type: DataTypes.STRING(60), allowNull: true, field: "cta_label" },
    ctaHref: { type: DataTypes.STRING(255), allowNull: true, field: "cta_href" },
    publishedAt: { type: DataTypes.DATE, allowNull: false, field: "published_at" },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
  },
  {
    sequelize,
    tableName: "announcements",
    modelName: "Announcement",
  },
);
