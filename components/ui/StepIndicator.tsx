export function StepIndicator({
  step,
  total,
  label,
}: {
  step: number;
  total: number;
  label: string;
}) {
  return (
    <div className="mb-5">
      <div className="mb-5 flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < step
                ? "bg-primary-500"
                : i === step
                  ? "bg-primary-500/50"
                  : "bg-neutral-200"
            }`}
          />
        ))}
      </div>
      <div className="mb-3.5 text-[0.7rem] font-bold text-neutral-400">
        Step {step + 1} of {total} — <strong className="text-neutral-900">{label}</strong>
      </div>
    </div>
  );
}
