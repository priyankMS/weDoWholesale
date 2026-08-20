import Link from "next/link";

// Screens 42/43 (404 / 500) share a minimal topbar — logo only on mobile
// (the mockup's `.mini-topbar`), with a couple of plain nav links added at
// the desktop breakpoint (an element the *-desktop.html preview frame
// introduces that the plain mobile file doesn't have — same pattern as
// Phase 1 auth's desktop-only nav bar). Deliberately session-independent
// (no TopNav reuse): these pages can render for signed-out visitors too.
export function UtilityTopbar({
  subtitle,
  links = [],
}: {
  subtitle: string;
  links?: { href: string; label: string }[];
}) {
  return (
    <div className="border-b-[1.5px] border-neutral-200 bg-white px-4.5 py-3.5 lg:flex lg:items-center lg:justify-between lg:px-12 lg:py-4">
      <div>
        <div className="font-serif text-[1.3rem] font-black tracking-tight text-neutral-900">
          WeDoHalal<span className="text-primary-500">.</span>
        </div>
        <div className="mt-0.5 text-[0.7rem] font-semibold text-neutral-400">{subtitle}</div>
      </div>
      {links.length > 0 && (
        <div className="mt-3 hidden gap-6 lg:mt-0 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.78rem] font-semibold text-neutral-500 hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
