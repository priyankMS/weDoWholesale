"use client";

import { Toaster as SonnerToaster } from "sonner";

// Mounted once in the root layout. `richColors` gives success/error toasts
// their semantic green/red automatically; everything else is themed to
// match the rest of the UI (Manrope, rounded-2xl cards, brand radius).
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: "var(--font-sans)",
          borderRadius: "1rem",
          fontSize: "0.86rem",
          fontWeight: 600,
        },
      }}
    />
  );
}
