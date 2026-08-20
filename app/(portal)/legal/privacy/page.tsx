import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LegalDocument, type LegalTocItem } from "@/components/portal/legal/LegalDocument";
import { LegalSection } from "@/components/portal/legal/LegalSection";
import { LegalCallout } from "@/components/portal/legal/LegalCallout";
import { LegalFooter } from "@/components/portal/legal/LegalFooter";

const TOC: LegalTocItem[] = [
  { id: "priv-1", num: "1", title: "Information we collect" },
  { id: "priv-2", num: "2", title: "How we use your information" },
  { id: "priv-3", num: "3", title: "Disclosure of information" },
  { id: "priv-4", num: "4", title: "Data retention" },
  { id: "priv-5", num: "5", title: "Your rights" },
  { id: "priv-6", num: "6", title: "Cookies and tracking" },
  { id: "priv-7", num: "7", title: "Data security" },
  { id: "priv-8", num: "8", title: "International transfers" },
  { id: "priv-9", num: "9", title: "Contact us" },
];

const DATA_TYPES = [
  {
    type: "Business information",
    purpose:
      "Business name, address, type (restaurant, grocery, mosque, catering), city, and monthly volume estimate provided at registration.",
  },
  {
    type: "Contact person details",
    purpose: "Name, role, email address, and WhatsApp number of the primary account contact.",
  },
  {
    type: "Account credentials",
    purpose:
      "Email address and hashed password for portal login. We do not store plaintext passwords.",
  },
  {
    type: "Order history",
    purpose:
      "All orders placed, including items, quantities, delivery addresses, payment methods, and revision logs.",
  },
  {
    type: "Payment records",
    purpose:
      "Invoice amounts, payment status, and method. Card transactions are processed via Stripe — we do not store full card numbers.",
  },
  {
    type: "Usage information",
    purpose:
      "IP address, browser type, pages visited, and session duration, collected via Google Analytics to improve the portal.",
  },
];

// Screen 33 — Privacy Policy.
export default async function PrivacyPolicyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <LegalDocument
      docHref="/legal/privacy"
      eyebrow="Your data, explained"
      title="Privacy Policy"
      icon="🔒"
      mobileMeta="Last updated: January 15, 2025 · Jurisdiction: Alberta, Canada"
      kicker="Legal documents"
      metaItems={[
        { icon: "📅", label: "Last updated January 15, 2025" },
        { icon: "📍", label: "Jurisdiction: Alberta, Canada" },
      ]}
      toc={TOC}
      footer={
        <LegalFooter
          lastUpdatedLabel="Privacy Policy last updated January 15, 2025."
          otherLinks={[
            { href: "/legal/terms", label: "Terms & Conditions" },
            { href: "/legal/delivery", label: "Delivery Policy" },
          ]}
        />
      }
    >
      <LegalSection id="priv-1" num="1" title="Information we collect">
        <p>
          WeDoHalal.com collects the following categories of information from wholesale account
          holders:
        </p>
        <div className="-mx-4 divide-y divide-neutral-200 border-t border-neutral-200">
          {DATA_TYPES.map((d) => (
            <div key={d.type} className="px-4 py-2.75">
              <div className="mb-0.75 text-[0.82rem] font-bold text-neutral-900">{d.type}</div>
              <div className="text-[0.76rem] leading-relaxed text-neutral-500">{d.purpose}</div>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection id="priv-2" num="2" title="How we use your information">
        <p>We use the information we collect to:</p>
        <ul>
          <li>Process, fulfil, and deliver your wholesale orders</li>
          <li>
            Communicate with you about your orders, account, and invoices via email and WhatsApp
          </li>
          <li>Manage payment terms, credit limits, and billing</li>
          <li>
            Send you product announcements, pricing updates, and seasonal specials (if opted in)
          </li>
          <li>Improve portal features, product listings, and customer experience</li>
          <li>Comply with legal and regulatory obligations under Alberta law</li>
          <li>Prevent fraud, unauthorised access, and abuse of our services</li>
        </ul>
        <p>We do not use your personal data for advertising purposes or sell it to third parties.</p>
      </LegalSection>

      <LegalSection id="priv-3" num="3" title="Disclosure of information">
        <p>WeDoHalal shares your information only in the following limited circumstances:</p>
        <ul>
          <li>
            <strong>Payment processing:</strong> With Stripe to process card payments securely.
            Stripe does not receive your full order details.
          </li>
          <li>
            <strong>Delivery:</strong> Driver name, phone, and your delivery address are shared
            with our delivery personnel solely to complete your order.
          </li>
          <li>
            <strong>Analytics:</strong> Anonymised usage data is shared with Google Analytics. No
            personal data is passed.
          </li>
          <li>
            <strong>Legal requirements:</strong> If required by law, subpoena, or court order.
          </li>
          <li>
            <strong>Business transfers:</strong> If WeDoHalal is involved in a merger, acquisition,
            or asset sale, customer data may be transferred as part of that process.
          </li>
        </ul>
        <LegalCallout tone="info" icon="ℹ️">
          We do not share your personal data directly with suppliers. All supplier-facing
          communication is handled by WeDoHalal. Supplier names are de-emphasised in the portal to
          protect our supply chain and your account.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="priv-4" num="4" title="Data retention">
        <p>
          We retain your account data, order history, and contact details for as long as your
          account is active, and indefinitely thereafter unless you request deletion. This allows
          us to provide accurate order records, invoice history, and service continuity.
        </p>
        <p>
          Invoice and billing records are retained for a minimum of seven (7) years to comply with
          Canadian tax and accounting requirements, regardless of whether your account is active.
        </p>
        <p>
          You may request deletion of your personal data at any time by contacting us. Note that
          billing records legally required to be retained will be kept even after other data is
          deleted.
        </p>
      </LegalSection>

      <LegalSection id="priv-5" num="5" title="Your rights">
        <p>As an account holder, you have the following rights regarding your personal data:</p>
        <ul>
          <li>
            <strong>Access:</strong> Request a copy of the personal information we hold about your
            account and orders.
          </li>
          <li>
            <strong>Correction:</strong> Update or correct your business profile, contact details,
            or delivery addresses at any time through the portal.
          </li>
          <li>
            <strong>Deletion:</strong> Request that we delete your account and associated personal
            data. Billing records will be retained as required by law.
          </li>
          <li>
            <strong>Withdraw consent:</strong> Opt out of marketing emails and promotional
            WhatsApp messages at any time through Notification Preferences.
          </li>
          <li>
            <strong>Portability:</strong> Request a copy of your order history and account data in
            a structured format.
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:help@wedohalal.com">help@wedohalal.com</a>. We will respond within 10
          business days.
        </p>
      </LegalSection>

      <LegalSection id="priv-6" num="6" title="Cookies and tracking">
        <p>
          The portal uses cookies and similar technologies to maintain your login session,
          remember your preferences, and analyse usage patterns via Google Analytics. No
          advertising cookies are used.
        </p>
        <p>
          You can manage cookie preferences through your browser settings. Disabling session
          cookies will prevent you from staying logged in to the portal.
        </p>
      </LegalSection>

      <LegalSection id="priv-7" num="7" title="Data security">
        <p>
          We take reasonable technical and organisational measures to protect your data from
          unauthorised access, use, or disclosure. These include encrypted data transmission
          (HTTPS), hashed password storage, and restricted staff access to personal data.
        </p>
        <p>
          No method of data transmission or storage is 100% secure. In the event of a data breach
          that affects your personal information, we will notify you as required by applicable
          Canadian law.
        </p>
      </LegalSection>

      <LegalSection id="priv-8" num="8" title="International data transfers">
        <p>
          Your information may be stored or processed outside of Canada — in particular in the
          United States — when handled by third-party services such as Stripe (payment processing)
          and Google Analytics. These providers are contractually required to maintain appropriate
          data protection standards.
        </p>
        <p>
          By using the portal, you consent to the transfer of your data to these services for the
          purposes described in this policy.
        </p>
      </LegalSection>

      <LegalSection id="priv-9" num="9" title="Contact us">
        <p>
          If you have questions or concerns about this Privacy Policy or how we handle your data,
          please contact us:
        </p>
        <ul>
          <li>
            <strong>Email:</strong> <a href="mailto:help@wedohalal.com">help@wedohalal.com</a>
          </li>
          <li>
            <strong>Phone / WhatsApp:</strong> <a href="tel:+17807227623">+1 (780) 722-7623</a>
          </li>
          <li>
            <strong>Location:</strong> Edmonton, Alberta, Canada
          </li>
        </ul>
        <p>
          We will acknowledge your request within 5 business days and aim to resolve all privacy
          concerns within 30 days.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
