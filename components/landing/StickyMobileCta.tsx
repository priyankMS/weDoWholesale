export function StickyMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-90 border-t border-white/10 bg-charcoal-800 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
      <a
        href="#register"
        className="block w-full rounded-lg bg-primary-500 py-3.5 text-center text-[0.95rem] font-extrabold text-white"
      >
        Apply for a wholesale account →
      </a>
    </div>
  );
}
