import { NextResponse } from "next/server";

function csvCell(value: string | number | boolean | null): string {
  const str = value == null ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

// Shared by every /api/admin/export/* route — builds the same escaped CSV
// + attachment response app/api/admin/export/products/route.ts established
// first, so each resource's route only supplies its header row and cell
// values.
export function toCsvResponse(filenamePrefix: string, header: string[], rows: (string | number | boolean | null)[][]): NextResponse {
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wedohalal-${filenamePrefix}-${date}.csv"`,
    },
  });
}
