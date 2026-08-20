import { Op } from "sequelize";
import { WdhProduct } from "@/lib/db/models/WdhProduct";

export type SeoStatus = "complete" | "missing" | "warning";

export type AdminSeoRow = {
  id: number;
  sku: string | null;
  name: string;
  category: string;
  metaTitle: string | null;
  metaTitleLen: number;
  metaDesc: string | null;
  metaDescLen: number;
  hasAltTag: boolean;
  status: SeoStatus;
  score: number;
};

export type AdminSeoListParams = {
  category?: string;
  filter?: "missing" | "complete" | "warning";
  page?: number;
  pageSize?: number;
};

export type AdminSeoListResult = {
  rows: AdminSeoRow[];
  total: number;
  missingCount: number;
  page: number;
  pageSize: number;
};

// Same thresholds the mockup's SEO Manager column showed ("Title Len",
// "Desc Len") — a title under 30 chars or a description under 70 chars
// reads as too short for a search snippet, so those count as "warning"
// rather than "complete" even when the field is non-empty.
const MIN_TITLE_LEN = 30;
const MIN_DESC_LEN = 70;

function computeStatus(row: {
  metaTitle: string | null;
  metaDesc: string | null;
  hasAltTag: boolean;
}): { status: SeoStatus; score: number } {
  const titleLen = row.metaTitle?.trim().length ?? 0;
  const descLen = row.metaDesc?.trim().length ?? 0;

  if (titleLen === 0 || descLen === 0) return { status: "missing", score: 0 };

  let score = 40; // both fields present
  if (titleLen >= MIN_TITLE_LEN) score += 25;
  if (descLen >= MIN_DESC_LEN) score += 25;
  if (row.hasAltTag) score += 10;

  const warning = titleLen < MIN_TITLE_LEN || descLen < MIN_DESC_LEN || !row.hasAltTag;
  return { status: warning ? "warning" : "complete", score };
}

export async function listAdminSeoRows(params: AdminSeoListParams): Promise<AdminSeoListResult> {
  const { category, filter, page = 1, pageSize = 25 } = params;

  const where: Record<string, unknown> = {};
  if (category && category !== "All") where.category = category;

  const rows = await WdhProduct.findAll({
    where,
    attributes: ["id", "sku", "item", "category", "metaTitle", "metaDesc", "thumbnailAlt"],
    order: [["item", "ASC"]],
  });

  let mapped: AdminSeoRow[] = rows.map((p) => {
    const hasAltTag = !!p.thumbnailAlt?.trim();
    const { status, score } = computeStatus({
      metaTitle: p.metaTitle,
      metaDesc: p.metaDesc,
      hasAltTag,
    });
    return {
      id: p.id,
      sku: p.sku,
      name: p.item,
      category: p.category ?? "",
      metaTitle: p.metaTitle,
      metaTitleLen: p.metaTitle?.trim().length ?? 0,
      metaDesc: p.metaDesc,
      metaDescLen: p.metaDesc?.trim().length ?? 0,
      hasAltTag,
      status,
      score,
    };
  });

  const missingCount = mapped.filter((r) => r.status === "missing").length;

  if (filter) mapped = mapped.filter((r) => r.status === filter);

  const total = mapped.length;
  const start = (page - 1) * pageSize;
  const paged = mapped.slice(start, start + pageSize);

  return { rows: paged, total, missingCount, page, pageSize };
}

export async function getSeoMissingCount(): Promise<number> {
  return WdhProduct.count({
    where: {
      [Op.or]: [
        { metaTitle: null },
        { metaTitle: "" },
        { metaDesc: null },
        { metaDesc: "" },
      ],
    },
  });
}
