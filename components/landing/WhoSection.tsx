const TILES = [
  {
    icon: "🍽️",
    name: "Restaurants",
    desc: "Dine-in, takeaway, and fast-casual restaurants that need consistent weekly supply of fresh cuts across all species.",
  },
  {
    icon: "🛒",
    name: "Grocery and ethnic markets",
    desc: "Halal grocery stores and ethnic supermarkets that stock and retail certified meat to their own customer base.",
  },
  {
    icon: "🕌",
    name: "Mosques and community kitchens",
    desc: "Community organisations running Eid events, Ramadan iftars, Friday gatherings, or regular meal programmes.",
  },
  {
    icon: "🍱",
    name: "Catering companies",
    desc: "Catering operations serving weddings, corporate events, and community functions that require large, reliable orders.",
  },
];

export function WhoSection() {
  return (
    <section id="who" className="bg-white px-5 py-20 sm:py-14">
      <div className="mx-auto max-w-(--max-width)">
        <div className="mb-3 text-[0.66rem] font-extrabold tracking-widest text-primary-500 uppercase">
          Who it&apos;s for
        </div>
        <h2 className="mb-3.5 font-serif text-[clamp(1.7rem,3.5vw,2.6rem)] leading-tight font-black tracking-tight text-neutral-900">
          Built for businesses that buy in bulk
        </h2>
        <p className="max-w-140 text-base leading-relaxed text-neutral-700">
          WeDoHalal Wholesale is for any business in Edmonton and Alberta
          that needs a reliable, certified halal meat supply — from a single
          restaurant kitchen to a network of stores.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-2.5 md:grid-cols-4">
          {TILES.map((tile) => (
            <div
              key={tile.name}
              className="rounded-md border-[1.5px] border-neutral-200 bg-neutral-50 p-7 transition-all hover:-translate-y-0.75 hover:border-primary-500 sm:p-5"
            >
              <div className="mb-3.5 text-4xl">{tile.icon}</div>
              <div className="mb-1.5 text-base font-extrabold text-neutral-900">
                {tile.name}
              </div>
              <div className="text-[0.82rem] leading-relaxed text-neutral-700">
                {tile.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
