import type { BusinessType } from "@/lib/db/models/User";

export const BUSINESS_TYPES: { value: BusinessType; icon: string; name: string; sub: string }[] = [
  { value: "restaurant", icon: "🍽️", name: "Restaurant", sub: "Dine-in or takeaway" },
  { value: "grocery", icon: "🛒", name: "Grocery Store", sub: "Retail or ethnic market" },
  { value: "mosque", icon: "🕌", name: "Mosque / Community", sub: "Events and gatherings" },
  { value: "catering", icon: "🍱", name: "Catering", sub: "Weddings and events" },
];

export function BusinessTypeGrid({
  value,
  onChange,
}: {
  value: BusinessType | null;
  onChange: (value: BusinessType) => void;
}) {
  return (
    <div className="mb-3.5 grid grid-cols-2 gap-2">
      {BUSINESS_TYPES.map((type) => {
        const selected = value === type.value;
        return (
          <button
            type="button"
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`cursor-pointer rounded-xl border-2 p-3.5 text-center transition-all active:scale-96 ${
              selected
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-200 bg-white"
            }`}
          >
            <div className="mb-1.5 text-3xl">{type.icon}</div>
            <div className="text-[0.78rem] font-extrabold text-neutral-900">
              {type.name}
            </div>
            <div className="mt-0.5 text-[0.65rem] text-neutral-400">{type.sub}</div>
          </button>
        );
      })}
    </div>
  );
}
