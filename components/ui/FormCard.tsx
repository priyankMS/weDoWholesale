import { forwardRef, type ReactNode } from "react";

export function FormCard({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white">
      {children}
    </div>
  );
}

export function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="px-3.5 pt-3 pb-1">
      <label className="mb-0.5 block text-[0.66rem] font-extrabold tracking-wide text-neutral-400 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

const fieldClass =
  "w-full border-none bg-transparent py-1.5 pb-3 font-sans text-[0.95rem] font-medium text-neutral-900 outline-none placeholder:font-normal placeholder:text-neutral-400";

// forwardRef so react-hook-form's `register()` can attach its ref directly
// to the underlying native element.
export const TextInput = forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(function TextInput(props, ref) {
  return (
    <input
      {...props}
      ref={ref}
      className={`${fieldClass} ${props.className ?? ""}`}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.ComponentPropsWithoutRef<"select">
>(function Select(props, ref) {
  return (
    <select
      {...props}
      ref={ref}
      className={`${fieldClass} cursor-pointer ${props.className ?? ""}`}
    >
      {props.children}
    </select>
  );
});
