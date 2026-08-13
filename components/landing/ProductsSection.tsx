const PRODUCTS = [
  { icon: "🐄", name: "Beef", cuts: "Brisket · Ribs · Shank · Chuck · Tenderloin · Liver · Oxtail", price: "$7.50", unit: "/kg" },
  { icon: "🐔", name: "Chicken", cuts: "Whole · Breast · Thigh · Wings · Drumstick · Liver", price: "$4.25", unit: "/kg" },
  { icon: "🐑", name: "Lamb", cuts: "Rack · Leg · Shoulder · Chops · Shank · Ground", price: "$16.99", unit: "/kg" },
  { icon: "🐐", name: "Goat", cuts: "Leg · Shoulder · Ribs · Chops · Whole · Ground", price: "$13.99", unit: "/kg" },
  { icon: "🐟", name: "Fish and seafood", cuts: "Tilapia · Salmon · Cod · Trout · Catfish · Shrimp", price: "$11.99", unit: "/kg" },
  { icon: "🦃", name: "Turkey", cuts: "Whole · Breast · Drumstick · Wings · Ground", price: "$8.25", unit: "/kg" },
  { icon: "🧃", name: "Drinks", cuts: "Mango Juice · Water · Ayran · Rose Water", price: "$0.75", unit: "/bottle" },
];

export function ProductsSection() {
  return (
    <section id="products" className="bg-white py-20 sm:py-14">
      <div className="mx-auto max-w-(--max-width) px-5">
        <div className="mb-3 text-[0.66rem] font-extrabold tracking-widest text-primary-500 uppercase">
          Product catalogue
        </div>
        <h2 className="mb-3.5 font-serif text-[clamp(1.7rem,3.5vw,2.6rem)] leading-tight font-black tracking-tight text-neutral-900">
          40+ products across 7 categories
        </h2>
        <p className="max-w-140 text-base leading-relaxed text-neutral-700">
          Fresh and frozen. Alberta-raised and internationally sourced.
          Hand-slaughtered Zabiha and HMC certified. Full catalogue available
          once your account is approved.
        </p>
      </div>
      <div className="mt-10 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex max-w-(--max-width) gap-3.5">
          {PRODUCTS.map((p) => (
            <div
              key={p.name}
              className="w-50 shrink-0 cursor-pointer rounded-md border-[1.5px] border-neutral-200 bg-neutral-50 p-5.5 transition-colors hover:border-primary-500"
            >
              <div className="mb-2.5 text-4xl">{p.icon}</div>
              <div className="mb-1 text-[0.95rem] font-extrabold text-neutral-900">
                {p.name}
              </div>
              <div className="mb-2.5 text-[0.72rem] text-neutral-400">
                {p.cuts}
              </div>
              <div className="font-serif text-lg font-bold text-primary-600">
                From {p.price}
                <span className="ml-0.5 font-sans text-[0.7rem] font-medium text-neutral-400">
                  {p.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-7 max-w-(--max-width) px-5">
        <p className="text-[0.82rem] text-neutral-700">
          All products are available in the full catalogue once your account
          is approved. Pricing shown is the base wholesale rate — bulk
          discounts may apply for orders over 500 kg.
        </p>
      </div>
    </section>
  );
}
