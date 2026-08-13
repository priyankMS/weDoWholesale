function scoreOf(value: string) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

const LEVEL_CLASS = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-green-600"];
const LABELS = [
  "Enter a password",
  "Too short",
  "Weak",
  "Fair — add a number or symbol",
  "Strong password",
];

export function PasswordStrength({ value }: { value: string }) {
  const score = scoreOf(value);

  return (
    <div className="mb-3">
      <div className="mt-1.5 mb-2.5 flex gap-1">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={`h-0.75 flex-1 rounded-full ${
              i < score ? LEVEL_CLASS[score - 1] : "bg-neutral-200"
            }`}
          />
        ))}
      </div>
      <div className="text-[0.7rem] font-semibold text-neutral-400">
        {LABELS[score]}
      </div>
    </div>
  );
}
