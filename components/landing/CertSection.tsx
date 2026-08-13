const CERTS = [
  {
    icon: "🕌",
    name: "ISNA Canada",
    desc: "Islamic Society of North America — Canada. Hand-slaughtered (Zabiha). Covers all Alberta-raised beef, chicken, goat, and turkey.",
  },
  {
    icon: "🌿",
    name: "HMC — Halal Monitoring Committee",
    desc: "United Kingdom standard, accepted Canada-wide. Machine-slaughtered. Covers select chicken (Brazil), turkey, and beef (USA).",
  },
  {
    icon: "🌙",
    name: "IFANCA",
    desc: "Islamic Food and Nutrition Council of America. Hand-slaughtered. Covers lamb (Australia/New Zealand), goat (Pakistan), and oxtail.",
  },
];

export function CertSection() {
  return (
    <section className="border-y-[1.5px] border-green-200 bg-green-50 px-5 py-12">
      <div className="mx-auto max-w-(--max-width)">
        <div className="mb-9 text-center">
          <div className="mb-3 text-[0.66rem] font-extrabold tracking-widest text-green-600 uppercase">
            Halal certification
          </div>
          <h2 className="font-serif text-[clamp(1.7rem,3.5vw,2.6rem)] leading-tight font-black tracking-tight text-neutral-900">
            Certified by bodies your customers trust
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CERTS.map((cert) => (
            <div
              key={cert.name}
              className="flex items-start gap-3.5 rounded-md border-[1.5px] border-green-200 bg-white p-6"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-green-200 bg-green-50 text-xl">
                {cert.icon}
              </div>
              <div>
                <div className="mb-0.75 text-[0.9rem] font-extrabold text-neutral-900">
                  {cert.name}
                </div>
                <div className="text-[0.76rem] leading-normal text-neutral-700">
                  {cert.desc}
                </div>
                <div className="mt-1.5 inline-block rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[0.64rem] font-extrabold text-green-600">
                  ✓ Valid 2025 · Renewed annually
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[0.8rem] text-neutral-700">
          Full PDF copies of all certificates available on request — email{" "}
          <a
            href="mailto:help@wedohalal.com"
            className="font-bold text-green-600 no-underline"
          >
            help@wedohalal.com
          </a>
        </p>
      </div>
    </section>
  );
}
