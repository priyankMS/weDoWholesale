import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-charcoal-900 px-5 pt-14 pb-8">
      <div className="mx-auto grid max-w-(--max-width) grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-12">
        <div className="sm:col-span-2 md:col-span-1">
          <Link href="#" className="font-serif text-xl font-black text-white">
            WeDoHalal<span className="text-primary-500">.</span>
          </Link>
          <p className="mt-3 max-w-70 text-[0.8rem] leading-relaxed text-white/40">
            Certified halal meat delivered to restaurants, grocery stores,
            mosques, and catering companies across Edmonton and Alberta.
            B2B wholesale, done right.
          </p>
        </div>
        <div>
          <div className="mb-4 text-[0.66rem] font-extrabold tracking-widest text-white/35 uppercase">
            Wholesale
          </div>
          {[
            ["#who", "Who it's for"],
            ["#why", "Why us"],
            ["#how", "How it works"],
            ["#products", "Products"],
            ["#pricing", "Pricing and terms"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="mb-2.5 block text-[0.82rem] text-white/50 transition-colors hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>
        <div>
          <div className="mb-4 text-[0.66rem] font-extrabold tracking-widest text-white/35 uppercase">
            Support
          </div>
          <a href="#faq" className="mb-2.5 block text-[0.82rem] text-white/50 hover:text-white">
            FAQ
          </a>
          <a
            href="mailto:help@wedohalal.com"
            className="mb-2.5 block text-[0.82rem] text-white/50 hover:text-white"
          >
            Email us
          </a>
          <a
            href="https://wa.me/17807227623"
            className="mb-2.5 block text-[0.82rem] text-white/50 hover:text-white"
          >
            WhatsApp
          </a>
          <a
            href="https://wedohalal.com"
            className="mb-2.5 block text-[0.82rem] text-white/50 hover:text-white"
          >
            Retail site
          </a>
        </div>
        <div>
          <div className="mb-4 text-[0.66rem] font-extrabold tracking-widest text-white/35 uppercase">
            Legal
          </div>
          {["Wholesale T&C", "Privacy Policy", "Delivery Policy", "Halal Certs"].map(
            (label) => (
              <a
                key={label}
                href="#"
                className="mb-2.5 block text-[0.82rem] text-white/50 hover:text-white"
              >
                {label}
              </a>
            ),
          )}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-(--max-width) flex-wrap items-center justify-between gap-3 border-t border-white/7 pt-7">
        <div className="text-[0.76rem] text-white/30">
          © 2026 WeDoHalal · Edmonton, Alberta · help@wedohalal.com · +1 (780) 722-7623
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-green-600/30 bg-green-600/20 px-3 py-1.5 text-[0.7rem] font-extrabold text-green-300">
          ✓ Halal certified supply chain
        </div>
      </div>
    </footer>
  );
}
