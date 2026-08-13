"use client";

import { useState } from "react";

export function PasswordInput(
  props: React.ComponentPropsWithoutRef<"input">,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`w-full border-none bg-transparent py-1.5 pr-7 pb-3 font-sans text-[0.95rem] font-medium text-neutral-900 outline-none placeholder:font-normal placeholder:text-neutral-400 ${props.className ?? ""}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer border-none bg-none py-2 text-neutral-400"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? "🙈" : "👁"}
      </button>
    </div>
  );
}
