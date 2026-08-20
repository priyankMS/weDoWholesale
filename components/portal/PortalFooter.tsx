import Link from "next/link";

const LINKS = [
  { href: "/halal-certs", label: "Halal certifications" },
  { href: "/support", label: "Contact support" },
  { href: "/legal/terms", label: "Wholesale T&C" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/delivery", label: "Delivery Policy" },
];

export function PortalFooter() {
  return (
    <footer className="mt-10 border-t-[1.5px] border-neutral-200 px-5 py-6 lg:px-0">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="text-[0.76rem] text-neutral-400">
          © 2026 WeDoHalal Wholesale · Edmonton, Alberta ·{" "}
          <a href="mailto:help@wedohalal.com" className="font-semibold text-neutral-500 hover:text-neutral-900">
            help@wedohalal.com
          </a>{" "}
          ·{" "}
          <a href="tel:+17807227623" className="font-semibold text-neutral-500 hover:text-neutral-900">
            +1 (780) 722-7623
          </a>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.76rem] font-semibold text-neutral-400 hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
