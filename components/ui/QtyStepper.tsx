export function QtyStepper({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-[10px] border-[1.5px] border-neutral-200">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-10.5 w-9.5 items-center justify-center bg-neutral-50 text-lg font-bold text-primary-600 active:bg-primary-200"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        onChange={(e) => onChange(Math.max(min, parseInt(e.target.value, 10) || min))}
        className="h-10.5 w-11 border-x border-neutral-200 bg-white text-center font-sans text-[1rem] font-bold text-neutral-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-10.5 w-9.5 items-center justify-center bg-neutral-50 text-lg font-bold text-primary-600 active:bg-primary-200"
      >
        +
      </button>
    </div>
  );
}
