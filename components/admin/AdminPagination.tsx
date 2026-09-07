import Link from "next/link";

// Shared by every admin list page (Variants, Products, Customers, Orders,
// SEO, Pricing) — replaces each page's old "render every page number" block,
// which wrapped into an unreadable wall of buttons once a table passed a
// couple thousand rows (e.g. 1805 variants / 25 per page = 52 pages). Always
// shows first, last, the current page +/-1, and Prev/Next, collapsing any
// gap into a single "…".
function pageWindow(page: number, totalPages: number): (number | "…")[] {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const out: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("…");
    out.push(sorted[i]);
  }
  return out;
}

export function AdminPagination({
  page,
  totalPages,
  pageHref,
}: {
  page: number;
  totalPages: number;
  pageHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const linkClass =
    "rounded-md border border-[#e4e1dc] bg-white px-3 py-1.5 text-[13px] font-bold text-[#5a5450] hover:bg-[#f0ede9]";
  const disabledClass =
    "rounded-md border border-[#e4e1dc] bg-[#f7f5f2] px-3 py-1.5 text-[13px] font-bold text-[#c4c0bc]";

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={pageHref(page - 1)} className={linkClass}>
          ← Prev
        </Link>
      ) : (
        <span className={disabledClass}>← Prev</span>
      )}

      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1.5 text-[13px] text-[#9a9490]">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-[13px] font-bold ${
              p === page
                ? "bg-[#e05a4a] text-white"
                : "border border-[#e4e1dc] bg-white text-[#5a5450] hover:bg-[#f0ede9]"
            }`}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={pageHref(page + 1)} className={linkClass}>
          Next →
        </Link>
      ) : (
        <span className={disabledClass}>Next →</span>
      )}

      <span className="ml-2 text-[13px] text-[#9a9490]">
        Page {page} of {totalPages}
      </span>
    </div>
  );
}
