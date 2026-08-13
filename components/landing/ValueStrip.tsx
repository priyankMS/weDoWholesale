const ITEMS = [
  { icon: "🚚", text: "Free delivery", rest: "on all qualifying wholesale orders" },
  { icon: "✓", text: "Zabiha certified", rest: "— ISNA Canada, HMC, IFANCA" },
  { icon: "📦", text: "100 kg minimum", rest: "— beef, lamb, chicken, goat, fish and more" },
  { icon: "📅", text: "Net 15 / Net 30", rest: "available for approved accounts" },
];

export function ValueStrip() {
  return (
    <div className="bg-primary-500 px-5 py-4.5">
      <div className="mx-auto flex max-w-(--max-width) flex-wrap items-center justify-between gap-3">
        {ITEMS.map((item, i) => (
          <div key={item.text} className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[0.82rem] font-bold text-white/90">
              {item.icon} <strong className="text-white">{item.text}</strong> {item.rest}
            </div>
            {i < ITEMS.length - 1 && (
              <div className="hidden h-5 w-px bg-white/25 sm:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
