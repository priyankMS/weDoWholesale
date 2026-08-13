import Link from "next/link";
import { HeroCounters } from "@/components/landing/HeroCounters";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-charcoal-900 px-5 pt-20 pb-20 lg:pt-32">
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-140 w-140 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(217,64,48,0.18) 0%, transparent 68%)",
        }}
      />
      <div className="relative z-10 mx-auto grid w-full max-w-(--max-width) grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/15 px-3.5 py-1.5 text-[0.72rem] font-extrabold tracking-wide text-primary-200 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500" />
            Edmonton · Alberta · B2B Wholesale
          </div>
          <h1 className="mb-5 font-serif text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.08] font-black tracking-tight text-white">
            Certified halal meat,
            <br />
            bulk quantities,
            <br />
            <em className="text-primary-500 italic">delivered to you.</em>
          </h1>
          <p className="mb-9 max-w-120 text-[1.05rem] leading-relaxed text-white/65">
            WeDoHalal Wholesale supplies restaurants, grocery stores, mosques,
            and catering companies across Edmonton with fresh and frozen
            halal meat — direct delivery, competitive bulk pricing, and
            flexible payment terms.
          </p>
          <div className="mb-11 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-8 py-4 text-[0.95rem] font-extrabold text-white transition-colors hover:bg-primary-600"
            >
              Apply for a wholesale account →
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-white/20 bg-white/8 px-7 py-4 text-[0.95rem] font-bold text-white transition-colors hover:border-white/35 hover:bg-white/13"
            >
              See how it works
            </a>
          </div>
          <div className="flex flex-wrap gap-5">
            {[
              "ISNA Canada certified",
              "100 kg min order",
              "Next-day delivery",
              "Net 15 / 30 terms",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-1.5 text-[0.76rem] font-semibold text-white/45"
              >
                ✓ <span className="text-white/65">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="order-first md:order-none">
          <HeroCounters />
        </div>
      </div>
    </section>
  );
}
