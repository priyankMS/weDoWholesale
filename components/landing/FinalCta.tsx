export function FinalCta() {
  return (
    <section
      id="register"
      className="relative overflow-hidden bg-primary-500 px-5 py-20 text-center"
    >
      <h2 className="relative mb-4 font-serif text-[clamp(2rem,5vw,3.2rem)] leading-[1.12] font-black tracking-tight text-white">
        Ready to simplify your halal meat supply?
      </h2>
      <p className="relative mx-auto mb-9 max-w-130 text-base leading-relaxed text-white/80">
        Apply for a wholesale account in under 5 minutes. Browse immediately,
        order as soon as you&apos;re approved — usually within 24 hours.
      </p>
      <div className="relative flex flex-wrap justify-center gap-3">
        <a
          href="https://wedohalal.com/wholesale/register"
          className="rounded-lg bg-white px-9 py-4 text-base font-extrabold text-primary-500 transition-opacity hover:opacity-90"
        >
          Apply for an account — it&apos;s free
        </a>
        <a
          href="https://wa.me/17807227623?text=Hi%20WeDoHalal%2C%20I%27m%20interested%20in%20a%20wholesale%20account."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-white/45 px-7 py-4 text-base font-bold text-white transition-colors hover:border-white/75"
        >
          💬 Talk to us on WhatsApp
        </a>
      </div>
      <p className="relative mt-6 text-[0.76rem] text-white/50">
        No application fee. No commitment. Approval within 24 hours.
      </p>
    </section>
  );
}
