import Link from "next/link";

const NAV_LINKS = [
  { href: "#who", label: "Who it's for" },
  { href: "#why", label: "Why us" },
  { href: "#how", label: "How it works" },
  { href: "#products", label: "Products" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  return (
    <div className="fixed inset-x-0 top-0 z-100">
      {/* Announcement bar — desktop only */}
      <div className="hidden bg-charcoal-900 px-12 py-2 lg:flex lg:items-center lg:justify-between">
        <div className="text-[0.67rem] font-medium text-white/45">
          🚚 <strong className="text-primary-500">Free delivery</strong> on
          wholesale orders $100+ · Next-day before 3 PM
        </div>
        <div className="flex gap-5">
          <a href="https://wedohalal.com" className="text-[0.67rem] font-medium text-white/45 hover:text-white">
            Shop
          </a>
          <a href="#" className="text-[0.67rem] font-medium text-white/45 hover:text-white">
            Wholesale
          </a>
          <a href="mailto:help@wedohalal.com" className="text-[0.67rem] font-medium text-white/45 hover:text-white">
            Contact
          </a>
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="hidden h-18 items-center justify-between border-b border-primary-200 bg-primary-50 px-12 lg:flex">
        <Link href="#" className="flex items-center gap-2.5 font-serif text-[1.35rem] font-black text-neutral-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-primary-500 font-serif text-base font-black text-white">
            W
          </span>
          WeDoHalal<em className="text-primary-500 not-italic">.</em>
          <span className="rounded border border-primary-200 bg-primary-500/15 px-1.5 py-0.5 font-sans text-[0.58rem] font-extrabold tracking-wide text-primary-500 uppercase">
            Wholesale
          </span>
        </Link>
        <div className="flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.78rem] font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-[9px] border-[1.5px] border-primary-200 px-4.5 py-2 text-[0.78rem] font-bold text-neutral-900"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-[9px] bg-primary-500 px-5.5 py-2.5 text-[0.78rem] font-extrabold text-white shadow-[0_4px_14px_rgba(217,64,48,0.28)] transition-colors hover:bg-primary-600"
          >
            Apply for an account
          </Link>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="flex h-14 items-center justify-between border-b border-white/7 bg-charcoal-900 px-4 lg:hidden">
        <Link href="#" className="font-serif text-[1.2rem] font-black tracking-tight text-white">
          WeDoHalal<em className="text-primary-500 not-italic">.</em>
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-primary-500 px-3.5 py-2 text-[0.8rem] font-extrabold text-white"
        >
          Apply →
        </Link>
      </div>
    </div>
  );
}
