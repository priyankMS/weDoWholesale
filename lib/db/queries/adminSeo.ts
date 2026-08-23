import { Op } from "sequelize";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { computeSeoStatus, type SeoStatus } from "@/lib/seo";

export type { SeoStatus };

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

const computeStatus = computeSeoStatus;

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
