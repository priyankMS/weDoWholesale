const CERTS = [
  {
    icon: "🕌",
    name: "ISNA Canada",
    country: "Islamic Society of North America (Canada)",
    certNo: "ISNA-CA-2025-04412",
    slaughter: "Hand-Slaughtered (Zabiha)",
    issued: "Jan 15, 2025",
    expires: "Dec 31, 2025",
    appliesTo: ["Beef", "Chicken", "Goat", "Turkey"],
    origin: "Alberta, Canada",
  },
  {
    icon: "🌿",
    name: "HMC (Halal Monitoring Committee)",
    country: "United Kingdom — accepted Canada-wide",
    certNo: "HMC-UK-2025-8830",
    slaughter: "Machine-Slaughtered (HMC standard)",
    issued: "Feb 1, 2025",
    expires: "Jan 31, 2026",
    appliesTo: ["Chicken (Brazil)", "Turkey (Canada)", "Beef (USA)"],
    origin: "Brazil, Canada, USA",
  },
  {
    icon: "🌙",
    name: "IFANCA",
    country: "Islamic Food and Nutrition Council of America",
    certNo: "IFANCA-2025-AU-0229",
    slaughter: "Hand-Slaughtered (Zabiha)",
    issued: "Mar 1, 2025",
    expires: "Feb 28, 2026",
    appliesTo: ["Lamb (AUS/NZ)", "Goat (PAK)", "Oxtail"],
    origin: "Australia, New Zealand, Pakistan",
  },
];

export default function HalalCertsPage() {
  return (
    <div className="pb-4">
      <div className="relative mx-4 mt-3.5 mb-3 overflow-hidden rounded-2xl bg-primary-500 p-5 text-white lg:mx-0 lg:mt-6">
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[5rem] font-black opacity-10"
        >
          ✓
        </span>
        <div className="relative z-10">
          <div className="mb-1.25 text-[0.66rem] font-extrabold tracking-widest uppercase opacity-80">
            Verified &amp; Compliant
          </div>
          <div className="mb-1.5 font-serif text-[1.3rem] font-black">
            Our halal certifications
          </div>
          <div className="text-[0.8rem] leading-relaxed opacity-90">
            All WeDoHalal products are sourced from suppliers certified by
            recognized Islamic certifying bodies. Certificates are renewed
            annually.
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-4 lg:grid lg:grid-cols-3 lg:px-0">
        {CERTS.map((c) => (
          <div
            key={c.name}
            className="overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white"
          >
            <div className="flex items-center gap-3.5 border-b border-neutral-200 p-4">
              <div className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-[10px] border border-green-200 bg-green-50 text-[1.5rem]">
                {c.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[0.95rem] font-extrabold text-neutral-900">{c.name}</div>
                <div className="text-[0.72rem] font-semibold text-neutral-400">{c.country}</div>
              </div>
              <span className="shrink-0 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[0.66rem] font-extrabold whitespace-nowrap text-green-600">
                ✓ Valid 2025
              </span>
            </div>
            {[
              ["Certificate No.", c.certNo],
              ["Slaughter method", c.slaughter],
              ["Issued", c.issued],
              ["Expires", c.expires],
              ["Origin coverage", c.origin],
            ].map(([label, val]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-2.5 text-[0.82rem]"
              >
                <span className="font-medium text-neutral-700">{label}</span>
                <span className="max-w-[60%] text-right font-bold text-neutral-900">{val}</span>
              </div>
            ))}
            <div className="flex items-start justify-between gap-3 px-4 py-2.5 text-[0.82rem]">
              <span className="font-medium text-neutral-700">Applies to</span>
              <div className="flex max-w-[65%] flex-wrap justify-end gap-1">
                {c.appliesTo.map((a) => (
                  <span
                    key={a}
                    className="rounded-md bg-primary-50 px-1.75 py-0.5 text-[0.62rem] font-bold text-primary-600"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-4 mt-3.5 mb-3.5 flex items-start gap-2.5 rounded-xl border-[1.5px] border-amber-300 bg-amber-50 px-4 py-3.5 lg:mx-0">
        <div className="text-[1.1rem]">📋</div>
        <div className="text-[0.8rem] leading-relaxed font-semibold text-amber-800">
          Fish and seafood products are naturally permissible (halal by
          default) under all major Islamic schools of thought and do not
          require a halal certificate.
        </div>
      </div>

      <div className="mx-4 mb-4 flex items-center gap-3.5 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4 lg:mx-0">
        <div className="text-[1.4rem]">📩</div>
        <div className="text-[0.82rem] leading-relaxed text-neutral-700">
          <span className="mb-0.5 block font-extrabold text-neutral-900">
            Need a copy for your records?
          </span>
          Email us at{" "}
          <a href="mailto:help@wedohalal.com" className="font-bold text-primary-500">
            help@wedohalal.com
          </a>{" "}
          and we&apos;ll send you the full PDF certificates within 24 hours.
        </div>
      </div>
    </div>
  );
}
