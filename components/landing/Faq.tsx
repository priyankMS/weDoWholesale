"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "What is the minimum order to get delivery?",
    a: "The minimum total order weight for wholesale delivery is 100 kg. Orders below this threshold are not eligible for delivery but can be collected in person from our Edmonton warehouse. Individual product minimums (typically 5–20 kg per cut) are shown on each product listing.",
  },
  {
    q: "How long does account approval take?",
    a: "Most applications are reviewed within 24 hours, and many are approved the same day. You can browse the full catalogue immediately after registering. Ordering is unlocked once your account is approved — we'll notify you by WhatsApp and email.",
  },
  {
    q: "When do orders need to be placed for next-day delivery?",
    a: "Orders placed before 3:00 PM Monday through Saturday will be delivered the following business day. Orders placed Sunday or after the 3 PM cutoff will be delivered the next available business day. We do not deliver on Canadian federal public holidays — schedule changes are announced on the portal's announcement board at least 7 days in advance.",
  },
  {
    q: "What halal certifications do your products carry?",
    a: "We source from suppliers certified by ISNA Canada, HMC (Halal Monitoring Committee, UK), and IFANCA. The slaughter method (hand-slaughtered Zabiha or machine-slaughtered HMC) is shown on every product listing. Full PDF certificate copies are available on request by emailing help@wedohalal.com.",
  },
  {
    q: "Can I get Net 15 or Net 30 payment terms?",
    a: "Yes. Net 15 and Net 30 terms are available for accounts that have placed at least a few orders and have a good payment history. The default starting credit limit is $5,000. To apply, email help@wedohalal.com or message us on WhatsApp with your account ID. Our team reviews requests within 2 business days.",
  },
  {
    q: "What happens if an item I ordered is out of stock?",
    a: "We will notify you via WhatsApp and email before dispatch. We will either substitute with an equivalent item at the same price (same cut, similar origin, same halal certification) or remove the item and adjust your invoice. You always have the right to refuse a substitution — just let us know before 8 AM on dispatch day.",
  },
  {
    q: "Do you deliver to Calgary?",
    a: "Calgary wholesale delivery is in active development and expected to launch in late 2025. We currently deliver across Edmonton and surrounding communities including Sherwood Park, St. Albert, Spruce Grove, Fort Saskatchewan, Leduc, Nisku, Devon, and Beaumont. Register now and we'll notify you as soon as Calgary delivery is live.",
  },
  {
    q: "Can I place a special order for Eid or a large event?",
    a: "Yes — we handle whole animal orders (whole goat, whole lamb) and large-volume event orders regularly. For Eid al-Adha, we open advance bookings and recommend placing your order at least 5 business days ahead to guarantee availability. Contact us on WhatsApp or watch the announcements board in your portal account for seasonal order windows.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-white px-5 py-20 sm:py-14">
      <div className="mx-auto max-w-(--max-width)">
        <div className="text-center">
          <div className="mb-3 text-[0.66rem] font-extrabold tracking-widest text-primary-500 uppercase">
            Common questions
          </div>
          <h2 className="font-serif text-[clamp(1.7rem,3.5vw,2.6rem)] leading-tight font-black tracking-tight text-neutral-900">
            Everything you need to know
          </h2>
        </div>
        <div className="mx-auto mt-12 max-w-180">
          {FAQS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.q} className="border-b border-neutral-200">
                <button
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-[0.95rem] font-bold text-neutral-900 hover:text-primary-500"
                >
                  {item.q}
                  <span
                    className={`shrink-0 text-[0.85rem] font-extrabold text-neutral-400 transition-transform ${
                      open ? "rotate-180 text-primary-500" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>
                {open && (
                  <div className="pb-4.5 text-[0.87rem] leading-loose text-neutral-700">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
