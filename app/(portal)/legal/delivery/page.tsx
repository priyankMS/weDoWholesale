import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LegalDocument } from "@/components/portal/legal/LegalDocument";
import { LegalSection } from "@/components/portal/legal/LegalSection";
import { LegalCallout } from "@/components/portal/legal/LegalCallout";
import { LegalFooter } from "@/components/portal/legal/LegalFooter";

const AREAS: { label: string; status: "active" | "soon" }[] = [
  { label: "Edmonton", status: "active" },
  { label: "Sherwood Park", status: "active" },
  { label: "St. Albert", status: "active" },
  { label: "Spruce Grove", status: "active" },
  { label: "Fort Saskatchewan", status: "active" },
  { label: "Leduc", status: "active" },
  { label: "Nisku", status: "active" },
  { label: "Devon", status: "active" },
  { label: "Beaumont", status: "active" },
  { label: "Stony Plain", status: "active" },
  { label: "Acheson", status: "active" },
  { label: "Calgary (coming)", status: "soon" },
];

const RATES: { placedBy: string; delivery: string; fee: string }[] = [
  { placedBy: "3:00 PM Mon–Fri", delivery: "Next business day", fee: "Free (100 kg+ orders)" },
  { placedBy: "3:00 PM Saturday", delivery: "Monday or Tuesday", fee: "Free (100 kg+ orders)" },
  { placedBy: "Sunday (any time)", delivery: "Tuesday", fee: "Free (100 kg+ orders)" },
  {
    placedBy: "After 3:00 PM cutoff",
    delivery: "Day after next business day",
    fee: "Free (100 kg+ orders)",
  },
  { placedBy: "Below 100 kg minimum", delivery: "Pickup only", fee: "No delivery available" },
];

// Screen 34 — Delivery Policy. Unlike Terms & Privacy (Screens 32/33),
// the mobile source has no `.toc-card` for this screen, so `toc` is
// omitted here — LegalDocument renders as a single-column content page
// with no TOC sidebar, matching the mockup.
export default async function DeliveryPolicyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <LegalDocument
      docHref="/legal/delivery"
      eyebrow="Wholesale delivery"
      title="Delivery Policy"
      icon="🚚"
      mobileMeta="Last updated: January 15, 2025 · Edmonton, Alberta"
      kicker="Legal documents"
      metaItems={[
        { icon: "📅", label: "Last updated January 15, 2025" },
        { icon: "📍", label: "Edmonton, Alberta" },
      ]}
      footer={
        <>
          <div className="mx-4 mb-2.5 flex items-center gap-3.5 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4 lg:mx-0">
            <div className="text-[1.4rem]">💬</div>
            <div>
              <div className="mb-0.5 text-[0.88rem] font-extrabold text-neutral-900">
                Delivery questions?
              </div>
              <div className="text-[0.76rem] leading-relaxed text-neutral-500">
                Message us on WhatsApp at +1 (780) 722-7623 or email help@wedohalal.com. We respond
                within 24 hours.
              </div>
            </div>
          </div>
          <LegalFooter
            lastUpdatedLabel="Delivery Policy last updated January 15, 2025."
            otherLinks={[
              { href: "/legal/terms", label: "Terms & Conditions" },
              { href: "/legal/privacy", label: "Privacy Policy" },
            ]}
          />
        </>
      }
    >
      <div className="px-4 pt-1 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Current delivery areas
      </div>
      <div className="mx-4 mb-4 lg:mx-0">
        <div className="grid grid-cols-2 gap-1.5">
          {AREAS.map((a) => (
            <div
              key={a.label}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[0.76rem] font-semibold ${
                a.status === "active"
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              {a.status === "active" ? "✓" : "⏳"} {a.label}
            </div>
          ))}
        </div>
        <div className="mt-2 px-0.5 text-[0.76rem] text-neutral-400">
          Deliveries outside these areas are not currently available. Contact us to be added to
          the Calgary waitlist.
        </div>
      </div>

      <div className="px-4 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Schedule and rates
      </div>
      <div className="mx-4 mb-4 overflow-hidden overflow-x-auto rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
        <table className="w-full text-left text-[0.8rem]">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-3 py-2.25 text-[0.66rem] font-extrabold tracking-wide text-neutral-400 uppercase">
                Order placed by
              </th>
              <th className="px-3 py-2.25 text-[0.66rem] font-extrabold tracking-wide text-neutral-400 uppercase">
                Delivery
              </th>
              <th className="px-3 py-2.25 text-[0.66rem] font-extrabold tracking-wide text-neutral-400 uppercase">
                Fee
              </th>
            </tr>
          </thead>
          <tbody>
            {RATES.map((r) => (
              <tr key={r.placedBy} className="border-b border-neutral-200 last:border-0">
                <td className="px-3 py-2.5 font-bold whitespace-nowrap text-neutral-900">
                  {r.placedBy}
                </td>
                <td className="px-3 py-2.5 text-neutral-500">{r.delivery}</td>
                <td className="px-3 py-2.5 font-semibold whitespace-nowrap text-green-600">
                  {r.fee}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LegalSection id="deliv-moq" icon="📦" title="Minimum order for delivery">
        <p>
          Delivery is available exclusively for wholesale orders meeting the{" "}
          <strong>100 kg minimum total weight</strong>. Orders that do not meet this threshold
          must be collected from our Edmonton warehouse. The pickup address is shared via WhatsApp
          after order confirmation.
        </p>
        <LegalCallout tone="warn" icon="⚠️">
          If your order falls below 100 kg after a substitution or item removal, our team will
          contact you before dispatch to discuss options.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="deliv-lead" icon="🕒" title="Order lead times">
        <p>
          Wholesale orders require a minimum of <strong>1 business day lead time</strong>. Orders
          placed before 3:00 PM on a business day will be packed and dispatched on the same
          evening for delivery the following morning.
        </p>
        <p>
          For Eid al-Adha, Ramadan, and other peak periods, extended lead times apply. Advance
          booking windows for seasonal orders will be communicated via the Announcements board. We
          strongly recommend placing seasonal orders at least <strong>5 business days</strong> in
          advance.
        </p>
      </LegalSection>

      <LegalSection id="deliv-windows" icon="🕗" title="Delivery windows">
        <p>Wholesale deliveries are scheduled in one of two windows, selected at checkout:</p>
        <ul>
          <li>
            <strong>Morning window:</strong> 8:00 AM – 12:00 PM
          </li>
          <li>
            <strong>Afternoon window:</strong> 12:00 PM – 5:00 PM
          </li>
        </ul>
        <p>
          Exact arrival times within each window cannot be guaranteed. Driver name and a narrower
          estimated arrival time will be sent to your registered WhatsApp number on the morning of
          delivery.
        </p>
      </LegalSection>

      <LegalSection id="deliv-receipt" icon="✅" title="Receiving your order">
        <p>
          A responsible person must be available at the delivery address to receive and inspect
          the order at the time of delivery. You should verify that the items, weights, and cuts
          match your order confirmation before signing off.
        </p>
        <p>
          Any discrepancies, damage, or quality issues must be reported to WeDoHalal{" "}
          <strong>within 1 hour of delivery</strong> with photographic evidence. Reports made
          after this window may not be eligible for a refund or credit.
        </p>
        <p>
          If no one is available to receive the order, our driver will attempt to contact your
          registered WhatsApp number. If unreachable, the order may be left at the premises at
          your own risk, or returned. A redelivery fee may apply.
        </p>
        <LegalCallout tone="info" icon="📱">
          Ensure your registered WhatsApp number is active and monitored on delivery days. This is
          our primary channel for driver communication and time-sensitive updates.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="deliv-cold" icon="🌡️" title="Cold chain and food safety">
        <p>
          All wholesale orders are transported in temperature-controlled coolers (Coleman
          PowerChill Portable Thermoelectric Coolers) to maintain safe food temperatures throughout
          transit. Products are packaged by suppliers in accordance with the City of Edmonton&rsquo;s
          food safety requirements.
        </p>
        <p>
          WeDoHalal takes responsibility for maintaining cold chain integrity during transport.
          Once the order is received and signed off, cold chain responsibility transfers to the
          buyer. You must ensure products are moved to appropriate refrigeration immediately upon
          receipt.
        </p>
      </LegalSection>

      <LegalSection id="deliv-holidays" icon="📅" title="Public holidays and closures">
        <p>
          WeDoHalal does not operate on Canadian federal public holidays. Holiday schedule changes
          are communicated at least 7 days in advance via the Announcements board in the portal and
          via WhatsApp to all active wholesale accounts.
        </p>
        <p>
          We recommend planning orders at least 3 business days ahead of any known public holiday
          to avoid scheduling gaps.
        </p>
      </LegalSection>

      <LegalSection id="deliv-calgary" icon="📍" title="Calgary expansion">
        <p>
          WeDoHalal is actively developing wholesale delivery capability in Calgary. A
          wholesale-first approach means we will establish supplier partnerships and logistics
          infrastructure before opening Calgary delivery to all accounts.
        </p>
        <p>
          Calgary wholesale accounts may register now and will be notified as soon as delivery is
          available in their area. To be added to the Calgary waitlist, contact us at{" "}
          <a href="mailto:help@wedohalal.com">help@wedohalal.com</a>.
        </p>
        <LegalCallout tone="info" icon="🗺️">
          Calgary delivery is expected to launch in late 2025, beginning with a wholesale-only
          phase. Retail Calgary delivery will follow once order volumes support the logistics
          costs.
        </LegalCallout>
      </LegalSection>
    </LegalDocument>
  );
}
