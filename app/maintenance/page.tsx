"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

// Phase 8 (Utility and Error) — Screen 44, maintenance / coming soon. A
// plain static route (not wired into middleware/route gating — flipping
// the app into maintenance mode would mean reading a platform-wide
// setting, and PlatformSetting.ts is explicitly out of scope for this
// build, owned by the concurrent admin-panel work). This page is reachable
// directly at /maintenance and is a self-contained visual state, matching
// the mockup 1:1 rather than being a live "is the site down" indicator.
//
// The *-desktop.html preview frame for this screen swaps the countdown
// ring + 4-step timeline for a static HH:MM:SS box trio and a flat
// progress bar — but that file has no <script> tag at all (a static,
// non-interactive preview, unlike the plain mobile file which drives its
// countdown live). We keep the mobile file's richer, working ring +
// timeline as the single implementation and just widen it at the lg:
// breakpoint, rather than re-building a second, less-interactive desktop
// design.

const TOTAL_MINUTES = 120;
const RING_CIRCUMFERENCE = 339;

const ETA_STEPS = [
  { label: "Database backup", status: "done" as const },
  { label: "Server update", status: "done" as const },
  { label: "Testing & QA", status: "active" as const },
  { label: "Back online", status: "pending" as const },
];

const STATUS_CHIPS = [
  { label: "Orders safe", tone: "ok" as const },
  { label: "WhatsApp live", tone: "ok" as const },
  { label: "Portal offline", tone: "warn" as const },
  { label: "Ordering paused", tone: "warn" as const },
];

const PARTICLES = [
  { icon: "🥩", left: "8%", duration: 14, delay: -3, size: "1.6rem" },
  { icon: "🍖", left: "22%", duration: 18, delay: -7, size: "1.2rem" },
  { icon: "🐑", left: "55%", duration: 12, delay: -1, size: "1.8rem" },
  { icon: "🥩", left: "72%", duration: 16, delay: -9, size: "1.3rem" },
  { icon: "🍖", left: "88%", duration: 20, delay: -5, size: "1rem" },
  { icon: "🐄", left: "38%", duration: 15, delay: -11, size: "1.5rem" },
];

export default function MaintenancePage() {
  const [remaining, setRemaining] = useState(TOTAL_MINUTES);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const hrs = Math.floor(remaining / 60);
  const mins = remaining % 60;
  const countdownNum = hrs >= 1 ? String(hrs).padStart(2, "0") : String(mins).padStart(2, "0");
  const countdownUnit = hrs >= 1 ? (hrs === 1 ? "hour" : "hours") : "minutes";
  const progress = (TOTAL_MINUTES - remaining) / TOTAL_MINUTES;
  const dashOffset = RING_CIRCUMFERENCE - RING_CIRCUMFERENCE * progress;

  function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    toast.success("Got it — we'll email you when we're back online");
    setEmail("");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-primary-500 px-7 py-10 text-center lg:px-10">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="animate-wdh-drift pointer-events-none absolute bottom-0 opacity-10 select-none"
          style={{
            left: p.left,
            fontSize: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.icon}
        </span>
      ))}

      <div className="relative z-10 mb-9 font-serif text-[1.5rem] font-black tracking-tight text-white/90 lg:text-[1.8rem]">
        WeDoHalal<span className="opacity-65">.</span>
      </div>

      {/* Countdown ring */}
      <div className="relative z-10 mb-7 h-30 w-30 lg:h-34 lg:w-34">
        <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-serif text-[2rem] leading-none font-black text-white lg:text-[2.3rem]">
            {countdownNum}
          </div>
          <div className="text-[0.62rem] font-extrabold tracking-widest text-white/70 uppercase">
            {countdownUnit}
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-2.5 font-serif text-[1.6rem] font-black text-white lg:text-[2rem]">
        Back shortly
      </div>
      <div className="relative z-10 mb-7 max-w-77.5 text-[0.86rem] leading-relaxed text-white/85 lg:max-w-100 lg:text-[0.92rem]">
        We&rsquo;re performing scheduled maintenance on the wholesale portal. Your account and
        order history are safe. We&rsquo;ll be back online in approximately 2 hours.
      </div>

      {/* Progress steps */}
      <div className="relative z-10 mb-5 w-full max-w-85 rounded-xl border border-white/20 bg-white/12 px-4.5 py-3.5 lg:max-w-100">
        <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-white/60 uppercase">
          Maintenance progress
        </div>
        <div className="flex items-center">
          {ETA_STEPS.map((step, i) => (
            <div key={step.label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-1 flex-col items-center text-center">
                <div
                  className={`mb-1.25 flex h-5.5 w-5.5 items-center justify-center rounded-full text-[0.72rem] font-extrabold ${
                    step.status === "done"
                      ? "bg-white/90 text-primary-600"
                      : step.status === "active"
                        ? "border-2 border-white/70 bg-white/30 text-white"
                        : "border-2 border-white/20 bg-white/10 text-white/40"
                  }`}
                >
                  {step.status === "done" ? "✓" : step.status === "active" ? "⋯" : i + 1}
                </div>
                <div className="text-[0.6rem] leading-tight font-bold text-white/65">{step.label}</div>
              </div>
              {i < ETA_STEPS.length - 1 && (
                <div
                  className={`mb-4.5 h-0.5 flex-1 ${step.status === "done" ? "bg-white/70" : "bg-white/20"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status chips */}
      <div className="relative z-10 mb-6 flex flex-wrap justify-center gap-2">
        {STATUS_CHIPS.map((chip) => (
          <div
            key={chip.label}
            className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.25 text-[0.7rem] font-bold text-white/85"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${chip.tone === "ok" ? "bg-[#6ee7a0]" : "bg-[#fcd34d]"}`} />
            {chip.label}
          </div>
        ))}
      </div>

      {/* Notify me */}
      <form onSubmit={handleNotify} className="relative z-10 mb-5 w-full max-w-85 lg:max-w-100">
        <label
          htmlFor="notifyEmail"
          className="mb-2 block text-[0.68rem] font-extrabold tracking-widest text-white/70 uppercase"
        >
          Notify me when back online
        </label>
        <div className="flex gap-2">
          <input
            id="notifyEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-[10px] border-none bg-white/95 px-4 py-3.25 text-[0.9rem] text-neutral-900 outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            className="cursor-pointer rounded-[10px] border-[1.5px] border-white/40 bg-white/20 px-4 py-3.25 text-[0.86rem] font-extrabold whitespace-nowrap text-white hover:bg-white/35"
          >
            Notify me
          </button>
        </div>
      </form>

      {/* Urgent orders */}
      <a
        href="https://wa.me/17807227623?text=Hi%2C%20the%20portal%20is%20down%20and%20I%20need%20to%20place%20an%20urgent%20wholesale%20order."
        target="_blank"
        rel="noreferrer"
        className="relative z-10 mb-4 flex w-full max-w-85 items-center gap-3 rounded-xl border-[1.5px] border-white/25 bg-white/15 px-4 py-3.5 text-left hover:bg-white/25 lg:max-w-100"
      >
        <div className="shrink-0 text-[1.4rem]">💬</div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 text-[0.84rem] font-extrabold text-white">Urgent order? WhatsApp us</div>
          <div className="text-[0.72rem] text-white/70">+1 (780) 722-7623 · 9 AM – 7 PM · 7 days</div>
        </div>
        <div className="shrink-0 text-[1rem] text-white/50">›</div>
      </a>

      <div className="relative z-10 max-w-70 text-[0.7rem] leading-relaxed text-white/45">
        WeDoHalal Wholesale · Edmonton, Alberta
        <br />
        <a href="mailto:help@wedohalal.com" className="text-white/55">
          help@wedohalal.com
        </a>
      </div>
    </div>
  );
}
