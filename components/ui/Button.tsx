import { type ComponentPropsWithoutRef } from "react";

const VARIANTS = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60 disabled:hover:bg-primary-500",
  ghost:
    "bg-white text-neutral-700 border-[1.5px] border-neutral-200 hover:bg-neutral-50",
  whatsapp: "bg-[#25D366] text-white hover:bg-[#1aad55]",
} as const;

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: keyof typeof VARIANTS;
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-4 text-[0.92rem] font-extrabold transition-colors cursor-pointer ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
