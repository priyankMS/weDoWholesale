const CARDS = [
  {
    icon: "💰",
    title: "Bulk pricing on everything",
    desc: "Wholesale rates across all 40+ products in the catalogue. Prices are clearly shown per kg — no hidden fees, no retail markup applied to your account.",
  },
  {
    icon: "✓",
    title: "Verified halal certification",
    desc: "Every product is sourced from suppliers certified by ISNA Canada, HMC, or IFANCA. Certification documents available on request for your own compliance records.",
  },
  {
    icon: "🚚",
    title: "Next-day delivery, free",
    desc: "Order before 3 PM and receive your delivery the next business day at no charge. Delivered in temperature-controlled coolers to maintain cold chain integrity.",
  },
  {
    icon: "📅",
    title: "Flexible payment terms",
    desc: "Default to invoice on delivery. Approved accounts can access Net 15 or Net 30 terms — a credit limit is set based on order history and account standing.",
  },
  {
    icon: "💬",
    title: "WhatsApp-first support",
    desc: "Direct line to our team. Questions about an order, substitutions, scheduling — message us and we respond within the hour during business hours, 7 days a week.",
  },
  {
    icon: "📋",
    title: "Full order transparency",
    desc: "Every substitution is logged in your order history. Every invoice is downloadable. Monthly statements available for your accounting team. No surprises.",
  },
];

export function WhySection() {
  return (
    <section id="why" className="bg-neutral-50 px-5 py-20 sm:py-14">
      <div className="mx-auto max-w-(--max-width)">
        <div className="mb-3 text-[0.66rem] font-extrabold tracking-widest text-primary-500 uppercase">
          Why WeDoHalal Wholesale
        </div>
        <h2 className="mb-3.5 font-serif text-[clamp(1.7rem,3.5vw,2.6rem)] leading-tight font-black tracking-tight text-neutral-900">
          Everything a bulk buyer needs. Nothing extra.
        </h2>
        <p className="max-w-140 text-base leading-relaxed text-neutral-700">
          We built this specifically for B2B buyers — the pricing, the order
          flow, the payment terms, and the communication are all designed
          around how a restaurant or grocery actually operates.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-md border-[1.5px] border-neutral-200 bg-white p-7.5 transition-colors hover:border-primary-200"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border-[1.5px] border-primary-200 bg-primary-50 text-2xl">
                {card.icon}
              </div>
              <div className="mb-2 text-base font-extrabold text-neutral-900">
                {card.title}
              </div>
              <div className="text-[0.84rem] leading-loose text-neutral-700">
                {card.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
