const TESTIMONIALS = [
  {
    quote:
      "We switched to WeDoHalal for our restaurant supply about six months ago. The ordering portal is simple, the meat arrives fresh next morning, and any questions go straight to WhatsApp. No middleman runaround.",
    avatar: "🍽️",
    name: "Ahmed K.",
    biz: "Restaurant owner, Edmonton",
  },
  {
    quote:
      "As a grocery store we need consistent weekly stock. WeDoHalal has never missed a delivery. The certificates are on file, and when we need a custom cut they just sort it out over WhatsApp.",
    avatar: "🛒",
    name: "Fatima S.",
    biz: "Halal grocery store, South Edmonton",
  },
  {
    quote:
      "For Eid we ordered whole goats and whole lambs for our community. The entire order was prepared exactly as specified, delivered on time, and the Zabiha certification was solid. Will use again next year.",
    avatar: "🕌",
    name: "Sheikh Omar",
    biz: "Masjid events coordinator, Edmonton",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-neutral-50 px-5 py-20 sm:py-14">
      <div className="mx-auto max-w-(--max-width)">
        <div className="mb-3 text-[0.66rem] font-extrabold tracking-widest text-primary-500 uppercase">
          What wholesale buyers say
        </div>
        <h2 className="mb-12 font-serif text-[clamp(1.7rem,3.5vw,2.6rem)] leading-tight font-black tracking-tight text-neutral-900">
          Trusted by Edmonton&apos;s halal food community
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-md border-[1.5px] border-neutral-200 bg-white p-7"
            >
              <div className="mb-3.5 tracking-widest text-primary-500">★★★★★</div>
              <div className="mb-4.5 text-[0.88rem] leading-loose text-neutral-700 italic before:content-['\201C'] after:content-['\201D']">
                {t.quote}
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-primary-200 bg-primary-50 text-base">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-[0.84rem] font-extrabold text-neutral-900">
                    {t.name}
                  </div>
                  <div className="text-[0.72rem] text-neutral-400">{t.biz}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
