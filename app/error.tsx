"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { UtilityTopbar } from "@/components/ui/UtilityTopbar";

// Phase 8 (Utility and Error) — Screen 43, the root error boundary
// (`app/error.tsx`). Error boundaries must be Client Components. This
// build targets the app's current Next.js docs (node_modules/next/dist/
// docs/01-app/03-api-reference/03-file-conventions/error.md), which now
// recommend the `retry()` prop over `reset()` — `retry()` re-fetches and
// re-renders the segment instead of just clearing local error state.
const STATUS_ROWS: { service: string; tone: "ok" | "degraded" | "down" }[] = [
  { service: "Portal & ordering", tone: "degraded" },
  { service: "Product catalogue", tone: "ok" },
  { service: "Checkout & payments", tone: "down" },
  { service: "WhatsApp support", tone: "ok" },
  { service: "Order tracking", tone: "ok" },
];

const STATUS_TONE_CLASS: Record<string, string> = {
  ok: "bg-green-50 text-green-600",
  degraded: "bg-amber-50 text-amber-700",
  down: "bg-primary-50 text-primary-600",
};

const STATUS_TONE_LABEL: Record<string, string> = {
  ok: "Operational",
  degraded: "Degraded",
  down: "Down",
};

const WHAT_TO_DO = [
  {
    icon: "🔄",
    iconBg: "bg-primary-50",
    title: "Try refreshing the page",
    desc: "Server errors are often temporary. Wait 30 seconds and refresh — it usually resolves on its own.",
  },
  {
    icon: "💬",
    iconBg: "bg-green-50",
    title: "Place your order via WhatsApp",
    desc: "If you need to place an urgent order, message us directly. We'll process it manually and confirm by WhatsApp.",
  },
  {
    icon: "📧",
    iconBg: "bg-amber-50",
    title: "Email us",
    desc: (
      <>
        Send your order details to{" "}
        <a href="mailto:help@wedohalal.com" className="font-bold text-primary-500">
          help@wedohalal.com
        </a>{" "}
        and we&rsquo;ll handle it within 2 hours during business hours.
      </>
    ),
  },
];

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const errorRef = `ERR_500 · ${error.digest ?? "no-digest"} · ${pathname}`;
  const waHref = `https://wa.me/17807227623?text=${encodeURIComponent(
    `Hi, I'm getting a 500 error on the wholesale portal. Error ref: ${errorRef}`,
  )}`;

  function copyRef() {
    navigator.clipboard
      .writeText(errorRef)
      .then(() => toast.success("Error reference copied"))
      .catch(() => toast(errorRef));
  }

  return (
    <div className="bg-neutral-50 lg:min-h-screen">
      <div className="hidden lg:block">
        <UtilityTopbar subtitle="Wholesale Portal" links={[{ href: "/catalogue", label: "Browse catalogue" }]} />
      </div>

      <div className="mx-auto max-w-160">
        {/* Dark hero */}
        <div className="relative overflow-hidden bg-neutral-900 px-6 py-8 text-center text-white lg:py-11">
          <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 font-serif text-[5rem] leading-none font-black tracking-[-4px] whitespace-nowrap text-white/10 select-none lg:text-[7rem]">
            500
          </div>
          <div className="relative z-10 mb-3.5 text-[3rem]">⚙️</div>
          <div className="relative z-10 mb-2 font-serif text-[1.4rem] leading-tight font-black lg:text-[1.7rem]">
            Something went wrong on our end
          </div>
          <div className="relative z-10 mx-auto max-w-110 text-[0.82rem] leading-relaxed text-white/75">
            Our server hit an unexpected issue. This isn&rsquo;t your fault — we&rsquo;ve been
            notified and are working on a fix.
          </div>
        </div>

        {/* Status card */}
        <div className="mx-4 mt-3.5 mb-2.5 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            <span>System status</span>
            <span className="flex items-center gap-1.5 text-[0.72rem] font-bold text-green-600 normal-case">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" /> Live
            </span>
          </div>
          {STATUS_ROWS.map((row, i) => (
            <div
              key={row.service}
              className={`flex items-center justify-between px-4 py-3 text-[0.84rem] ${
                i < STATUS_ROWS.length - 1 ? "border-b border-neutral-200" : ""
              }`}
            >
              <span className="font-semibold text-neutral-900">{row.service}</span>
              <span
                className={`rounded-full px-2.5 py-0.75 text-[0.66rem] font-extrabold ${STATUS_TONE_CLASS[row.tone]}`}
              >
                {STATUS_TONE_LABEL[row.tone]}
              </span>
            </div>
          ))}
        </div>

        <div className="px-4.5 pt-1 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
          What to do now
        </div>
        <div className="mx-4 mb-2.5 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
          {WHAT_TO_DO.map((item, i) => (
            <div
              key={item.title}
              className={`flex items-start gap-3 px-4 py-3.5 ${
                i < WHAT_TO_DO.length - 1 ? "border-b border-neutral-200" : ""
              }`}
            >
              <div
                className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[9px] text-[1.1rem] ${item.iconBg}`}
              >
                {item.icon}
              </div>
              <div>
                <div className="mb-0.75 text-[0.86rem] font-extrabold text-neutral-900">{item.title}</div>
                <div className="text-[0.76rem] leading-relaxed text-neutral-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Error reference */}
        <div className="mx-4 mb-2.5 rounded-xl border-[1.5px] border-neutral-200 bg-neutral-100 px-4 py-3.5 lg:mx-0">
          <div className="mb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Error reference
          </div>
          <div className="font-mono text-[0.78rem] leading-relaxed break-all text-neutral-500">{errorRef}</div>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={copyRef}
              className="cursor-pointer border-none bg-transparent p-0 text-[0.76rem] font-bold text-primary-500"
            >
              Copy reference
            </button>
            <span className="text-[0.72rem] text-neutral-400">Include this if you contact support</span>
          </div>
        </div>

        <div className="mx-4 flex flex-col gap-2 pb-8 lg:mx-0 lg:max-w-100">
          <Button onClick={retry}>Refresh the page</Button>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-4 text-[0.92rem] font-extrabold text-white transition-colors hover:bg-[#1aad55]"
          >
            💬 Order via WhatsApp instead
          </a>
          <Link
            href="/catalogue"
            className="flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-neutral-200 bg-white px-4 py-3.5 text-center text-[0.9rem] font-bold text-neutral-700 hover:bg-neutral-50"
          >
            ← Back to portal home
          </Link>
        </div>
      </div>
    </div>
  );
}
