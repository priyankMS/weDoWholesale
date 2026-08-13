export function AuthHero({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="relative mb-5 overflow-hidden rounded-2xl bg-primary-500 p-5.5 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-2.5 -bottom-3.5 rotate-[-12deg] text-8xl opacity-15"
      >
        🥩
      </div>
      <div className="mb-1.5 text-[0.66rem] font-extrabold tracking-widest opacity-80 uppercase">
        {eyebrow}
      </div>
      <div className="mb-2 font-serif text-[1.4rem] leading-tight font-black">
        {title}
      </div>
      <div className="text-[0.82rem] leading-relaxed opacity-90">{sub}</div>
    </div>
  );
}
