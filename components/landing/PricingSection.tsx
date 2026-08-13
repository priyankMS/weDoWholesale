import Link from "next/link";

const STANDARD_FEATURES = [
  "100 kg minimum for delivery",
  "Full catalogue access — 40+ products",
  "Next-day delivery, free",
  "Invoice on delivery (default)",
  "COD available with 2% surcharge",
  "E-Transfer accepted",
  "WhatsApp support, 7 days",
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-charcoal-900 px-5 py-20">
      <div className="mx-auto max-w-(--max-width)">
        <div className="mb-3 text-[0.66rem] font-extrabold tracking-widest text-primary-500/70 uppercase">
          Minimum orders and terms
        </div>
        <h2 className="mb-3.5 font-serif text-[clamp(1.7rem,3.5vw,2.6rem)] leading-tight font-black tracking-tight text-white">
          Transparent from day one
        </h2>
        <p className="max-w-140 text-base leading-relaxed text-white/55">
          No application fees. No subscription. You pay for what you order,
          at wholesale rates, with invoice terms that work for your business.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-md border border-white/12 bg-white/6 p-8">
            <div className="mb-2 text-[0.68rem] font-extrabold tracking-widest text-white/45 uppercase">
              Standard account
            </div>
            <div className="mb-4 font-serif text-2xl font-black text-white">
              Get started
            </div>
            {STANDARD_FEATURES.map((f) => (
              <div key={f} className="mb-2.5 flex items-start gap-2.5 text-[0.83rem] leading-normal text-white/65">
                <span className="shrink-0 font-extrabold text-primary-500">✓</span>
                {f}
              </div>
            ))}
            <div className="mb-2.5 flex items-start gap-2.5 text-[0.83rem] leading-normal text-white/30">
              <span className="shrink-0 font-extrabold text-white/20">—</span>
              Net 15 / 30 terms (approval required)
            </div>
            <Link
              href="/register"
              className="mt-6 block rounded-lg border-[1.5px] border-white/20 py-3.5 text-center text-[0.9rem] font-extrabold text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              Apply for free →
            </Link>
          </div>

          <div className="relative rounded-md border-2 border-primary-500/40 bg-primary-500/10 p-8">
            <div className="absolute top-5 right-5 rounded-full bg-primary-500 px-3 py-1 text-[0.68rem] font-extrabold tracking-wide text-white">
              Recommended
            </div>
            <div className="mb-2 text-[0.68rem] font-extrabold tracking-widest text-white/45 uppercase">
              Established account
            </div>
            <div className="mb-4 font-serif text-2xl font-black text-white">
              Full terms
            </div>
            {STANDARD_FEATURES.map((f) => (
              <div key={f} className="mb-2.5 flex items-start gap-2.5 text-[0.83rem] leading-normal text-white/65">
                <span className="shrink-0 font-extrabold text-primary-500">✓</span>
                {f}
              </div>
            ))}
            <div className="mb-2.5 flex items-start gap-2.5 text-[0.83rem] leading-normal text-white/65">
              <span className="shrink-0 font-extrabold text-primary-500">✓</span>
              <strong className="text-white">
                Net 15 / 30 terms — up to $5,000 credit
              </strong>
            </div>
            <Link
              href="/register"
              className="mt-6 block rounded-lg bg-primary-500 py-3.5 text-center text-[0.9rem] font-extrabold text-white transition-colors hover:bg-primary-600"
            >
              Apply for an account →
            </Link>
          </div>
        </div>
        <p className="mt-5 text-center text-[0.8rem] text-white/35">
          Net terms are available after account approval based on order
          history and business verification. Contact us to discuss your
          specific needs.
        </p>
      </div>
    </section>
  );
}
