"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    let frame: number;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, duration, target]);

  return value;
}

export function HeroCounters() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const kgDelivered = useCountUp(4280, 2200, active);
  const accounts = useCountUp(47, 1800, active);

  return (
    <div className="flex flex-col gap-3.5" ref={ref}>
      <div className="rounded-lg border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
        <div className="mb-1.5 text-[0.66rem] font-extrabold tracking-widest text-white/40 uppercase">
          Delivered this month
        </div>
        <div className="font-serif text-[3.4rem] leading-none font-black tracking-tight text-white">
          {kgDelivered.toLocaleString("en-CA")}
          <span className="ml-1 font-sans text-[1.4rem] font-bold tracking-normal text-primary-500">
            kg
          </span>
        </div>
        <div className="mt-1.5 text-[0.78rem] text-white/45">
          of certified halal meat across Edmonton
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-white/8 bg-white/5 p-4.5">
          <div className="mb-1 font-serif text-[1.8rem] leading-none font-black text-white">
            {accounts}
          </div>
          <div className="text-[0.72rem] font-semibold text-white/45">
            Active wholesale accounts
          </div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/5 p-4.5">
          <div className="mb-1 font-serif text-[1.8rem] leading-none font-black text-white">
            Next day
          </div>
          <div className="text-[0.72rem] font-semibold text-white/45">
            Delivery after 3 PM cutoff
          </div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/5 p-4.5">
          <div className="mb-1 font-serif text-[1.8rem] leading-none font-black text-white">
            7
          </div>
          <div className="text-[0.72rem] font-semibold text-white/45">
            Meat categories in catalogue
          </div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/5 p-4.5">
          <div className="mb-1 font-serif text-[1.8rem] leading-none font-black text-white">
            3
          </div>
          <div className="text-[0.72rem] font-semibold text-white/45">
            Active halal certifications
          </div>
        </div>
      </div>
    </div>
  );
}
