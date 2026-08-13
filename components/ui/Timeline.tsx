export type TimelineItem = {
  status: "done" | "active" | "pending";
  icon: string;
  title: string;
  desc: string;
};

const DOT_CLASS = {
  done: "bg-green-50 border-green-600",
  active: "bg-primary-50 border-primary-500",
  pending: "bg-white border-neutral-200",
} as const;

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="mb-5">
      {items.map((item, i) => (
        <div key={item.title} className="relative flex gap-3.5 pb-4.5 last:pb-0">
          {i < items.length - 1 && (
            <div className="absolute top-7 left-3.5 h-[calc(100%-14px)] w-0.5 bg-neutral-200" />
          )}
          <div
            className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[0.85rem] ${DOT_CLASS[item.status]}`}
          >
            {item.icon}
          </div>
          <div className="flex-1 pt-0.75">
            <div className="mb-0.5 text-[0.88rem] font-bold text-neutral-900">
              {item.title}
            </div>
            <div className="text-[0.75rem] leading-relaxed text-neutral-400">
              {item.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
