const STEPS = [
  {
    num: 1,
    title: "Apply for an account",
    desc: "Register your business — name, type, city, contact person. Our team reviews your application and approves most accounts within 24 hours. You can browse the catalogue immediately.",
  },
  {
    num: 2,
    title: "Browse and place your order",
    desc: "Select products, cuts, and quantities from our full catalogue. Filter by slaughter method, origin, and fat level. Build your order and check out with your preferred payment method.",
  },
  {
    num: 3,
    title: "We pack, we deliver",
    desc: "We cut, weigh, pack, and deliver your order next business day. You'll receive your driver's name and ETA via WhatsApp on the morning of delivery. Invoice follows by email.",
  },
];

export function HowSection() {
  return (
    <section id="how" className="bg-charcoal-900 px-5 py-20">
      <div className="mx-auto max-w-(--max-width)">
        <div className="mb-3 text-[0.66rem] font-extrabold tracking-widest text-primary-500/70 uppercase">
          How it works
        </div>
        <h2 className="mb-3.5 font-serif text-[clamp(1.7rem,3.5vw,2.6rem)] leading-tight font-black tracking-tight text-white">
          Three steps from signup to delivery
        </h2>
        <p className="max-w-140 text-base leading-relaxed text-white/55">
          Getting started takes less than 5 minutes. Approval usually comes
          through within 24 hours — often same day.
        </p>
        <div className="relative mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-0">
          <div className="pointer-events-none absolute top-7 right-[calc(16.67%+20px)] left-[calc(16.67%+20px)] hidden h-0.5 bg-primary-500/35 md:block" />
          {STEPS.map((step) => (
            <div key={step.num} className="relative px-6 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border-3 border-charcoal-900 bg-primary-500 font-serif text-xl font-black text-white">
                {step.num}
              </div>
              <div className="mb-2 text-base font-extrabold text-white">
                {step.title}
              </div>
              <div className="text-[0.83rem] leading-loose text-white/50">
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
