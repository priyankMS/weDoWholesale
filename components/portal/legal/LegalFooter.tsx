import Link from "next/link";

// Screens 32-34's `.legal-footer` — last-updated note + contact details,
// plus (on Privacy and Delivery) the "View our X or Y" cross-links to the
// other legal documents, matching the mockup's goScreen() footer links.
export function LegalFooter({
  lastUpdatedLabel,
  otherLinks = [],
}: {
  lastUpdatedLabel: string;
  otherLinks?: { href: string; label: string }[];
}) {
  return (
    <div className="mx-4 mt-1.5 mb-1 rounded-xl border-[1.5px] border-neutral-200 bg-white p-4 text-center text-[0.76rem] leading-relaxed text-neutral-400 lg:mx-0 lg:mt-6">
      {lastUpdatedLabel}
      <br />
      Questions? Email{" "}
      <a href="mailto:help@wedohalal.com" className="font-bold text-primary-500">
        help@wedohalal.com
      </a>{" "}
      or call{" "}
      <a href="tel:+17807227623" className="font-bold text-primary-500">
        +1 (780) 722-7623
      </a>
      {otherLinks.length > 0 && (
        <div className="mt-1.5">
          View our{" "}
          {otherLinks.map((l, i) => (
            <span key={l.href}>
              {i > 0 && " or "}
              <Link href={l.href} className="font-bold text-primary-500">
                {l.label}
              </Link>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
