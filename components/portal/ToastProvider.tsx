"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

const ToastContext = createContext<((msg: string) => void) | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    timerRef.current = setTimeout(() => setMessage(null), 2500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        className={`fixed bottom-22 left-1/2 z-999 -translate-x-1/2 rounded-full bg-neutral-900 px-5 py-2.5 text-[0.84rem] font-semibold whitespace-nowrap text-white transition-all duration-200 lg:bottom-6 ${
          message ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}
