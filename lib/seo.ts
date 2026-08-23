// Pure SEO-scoring logic shared between the server-rendered SEO Manager
// (lib/db/queries/adminSeo.ts) and the client-side product detail panel's
// live score preview — kept dependency-free (no Sequelize imports) so it's
// safe to bundle into "use client" components.

export type SeoStatus = "complete" | "missing" | "warning";

// A title under 30 chars or a description under 70 chars reads as too
// short for a search snippet, so those count as "warning" rather than
// "complete" even when the field is non-empty.
export const SEO_MIN_TITLE_LEN = 30;
export const SEO_MIN_DESC_LEN = 70;

export function computeSeoStatus(row: {
  metaTitle: string | null;
  metaDesc: string | null;
  hasAltTag: boolean;
}): { status: SeoStatus; score: number } {
  const titleLen = row.metaTitle?.trim().length ?? 0;
  const descLen = row.metaDesc?.trim().length ?? 0;

  if (titleLen === 0 || descLen === 0) return { status: "missing", score: 0 };

  let score = 40; // both fields present
  if (titleLen >= SEO_MIN_TITLE_LEN) score += 25;
  if (descLen >= SEO_MIN_DESC_LEN) score += 25;
  if (row.hasAltTag) score += 10;

  const warning = titleLen < SEO_MIN_TITLE_LEN || descLen < SEO_MIN_DESC_LEN || !row.hasAltTag;
  return { status: warning ? "warning" : "complete", score };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
