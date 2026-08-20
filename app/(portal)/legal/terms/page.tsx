import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LegalDocument, type LegalTocItem } from "@/components/portal/legal/LegalDocument";
import { LegalSection } from "@/components/portal/legal/LegalSection";
import { LegalCallout } from "@/components/portal/legal/LegalCallout";
import { LegalFooter } from "@/components/portal/legal/LegalFooter";

const TOC: LegalTocItem[] = [
  { id: "tc-1", num: "1", title: "Acceptance of terms" },
  { id: "tc-2", num: "2", title: "Account eligibility and approval" },
  { id: "tc-3", num: "3", title: "Orders and binding commitments" },
  { id: "tc-4", num: "4", title: "Minimum order quantities" },
  { id: "tc-5", num: "5", title: "Pricing and payment" },
  { id: "tc-6", num: "6", title: "Delivery" },
  { id: "tc-7", num: "7", title: "Substitutions" },
  { id: "tc-8", num: "8", title: "Cancellations and refunds" },
  { id: "tc-9", num: "9", title: "Halal compliance" },
  { id: "tc-10", num: "10", title: "Limitation of liability" },
  { id: "tc-11", num: "11", title: "Account termination" },
  { id: "tc-12", num: "12", title: "Governing law" },
];

// Screen 32 — Wholesale Terms & Conditions.
export default async function TermsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <LegalDocument
      docHref="/legal/terms"
      eyebrow="Wholesale accounts"
      title="Terms & Conditions"
      icon="⚖️"
      mobileMeta="Last updated: January 15, 2025 · Governing law: Alberta, Canada"
      kicker="Legal documents"
      metaItems={[
        { icon: "📅", label: "Last updated January 15, 2025" },
        { icon: "⚖️", label: "Governing law: Alberta, Canada" },
      ]}
      toc={TOC}
      footer={
        <LegalFooter
          lastUpdatedLabel="These terms were last updated January 15, 2025."
          otherLinks={[
            { href: "/legal/privacy", label: "Privacy Policy" },
            { href: "/legal/delivery", label: "Delivery Policy" },
          ]}
        />
      }
    >
      <LegalSection id="tc-1" num="1" title="Acceptance of terms">
        <p>
          By registering for a WeDoHalal wholesale account and using this portal, you agree to be
          bound by these Wholesale Terms &amp; Conditions, all applicable laws and regulations of
          Alberta, Canada, and any additional policies referenced herein.
        </p>
        <p>
          These terms apply exclusively to wholesale accounts (restaurants, grocery stores,
          mosques, catering companies, and other bulk buyers) and differ from the retail terms
          applicable to individual consumer orders.
        </p>
        <p>
          If you do not agree to these terms, you must not register for or use the wholesale
          portal. Continued use of the portal following any update to these terms constitutes
          acceptance of the revised version.
        </p>
      </LegalSection>

      <LegalSection id="tc-2" num="2" title="Account eligibility and approval">
        <p>
          Wholesale accounts are available to businesses operating in Edmonton and surrounding
          Alberta communities. All applications are subject to manual review and approval by
          WeDoHalal.
        </p>
        <p>To be eligible, you must:</p>
        <ul>
          <li>Be a registered business or legally operating organisation in Alberta</li>
          <li>
            Provide accurate business information including name, address, contact person, and
            business type
          </li>
          <li>Agree to minimum order requirements as set out in Section 4</li>
          <li>Not misrepresent your business type, volume, or intended use of products</li>
        </ul>
        <p>
          WeDoHalal reserves the right to decline any application without providing a reason.
          Approved accounts may be suspended or terminated at any time if account conditions are
          violated.
        </p>
        <LegalCallout tone="info" icon="✓">
          Once approved, you will receive a WhatsApp and email notification. Browse access is
          available during the review period, but ordering is restricted until approval is
          confirmed.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="tc-3" num="3" title="Orders and binding commitments">
        <LegalCallout tone="key" icon="⚖️">
          All wholesale orders are binding once placed. By submitting an order, you enter into a
          purchase commitment with WeDoHalal.
        </LegalCallout>
        <p>
          Orders may not be modified or cancelled after submission without prior written consent
          from WeDoHalal. Modification requests must be made before 8:00 AM on the scheduled
          dispatch date.
        </p>
        <p>WeDoHalal reserves the right to reject, cancel, or adjust any order that:</p>
        <ul>
          <li>Does not meet the minimum order quantity requirements</li>
          <li>Cannot be fulfilled due to stock unavailability</li>
          <li>
            Is placed by an account with an outstanding unpaid balance beyond agreed payment terms
          </li>
        </ul>
        <p>
          You will be notified immediately in any of these circumstances, and an alternative or
          refund will be offered where applicable.
        </p>
      </LegalSection>

      <LegalSection id="tc-4" num="4" title="Minimum order quantities">
        <p>
          A minimum total order weight of <strong>100 kg</strong> is required for wholesale
          delivery. Orders below this threshold are not eligible for delivery and must be
          collected in person from our Edmonton warehouse.
        </p>
        <p>
          Individual product minimum quantities (per cut or product type) are shown on each
          product listing and must also be met. Typical per-product minimums range from 5 kg to 20
          kg depending on category.
        </p>
        <p>
          Whole animal orders (e.g., whole goat, whole lamb) are sold at a flat per-animal price
          and are not subject to the 100 kg minimum if ordered as the primary item.
        </p>
      </LegalSection>

      <LegalSection id="tc-5" num="5" title="Pricing and payment">
        <p>
          All prices are displayed in Canadian Dollars (CAD) and are exclusive of GST. GST at the
          current rate of 5% will be applied to all taxable items at checkout. Most raw meat
          products are GST-exempt under Canadian tax law.
        </p>
        <p>Accepted payment methods:</p>
        <ul>
          <li>
            <strong>Cash on delivery (COD)</strong> — a 2% cash-handling surcharge applies
          </li>
          <li>
            <strong>E-Transfer</strong> — sent to payments@wedohalal.com before or at delivery
          </li>
          <li>
            <strong>Invoice on delivery</strong> — default for approved accounts; invoice emailed
            within 24 hours of delivery
          </li>
          <li>
            <strong>Net 15 / Net 30</strong> — available to accounts approved for credit terms;
            payment due within the agreed period from invoice date
          </li>
        </ul>
        <p>
          WeDoHalal reserves the right to withhold deliveries for accounts with overdue balances.
          Pricing is subject to change without notice. The price displayed at the time of order
          confirmation is the price that applies to that order.
        </p>
        <LegalCallout tone="warn" icon="⚠️">
          Accounts with balances outstanding beyond agreed payment terms may have their ordering
          access suspended until payment is received.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="tc-6" num="6" title="Delivery">
        <p>
          WeDoHalal currently delivers to Edmonton and surrounding communities. Orders placed
          before 3:00 PM will be scheduled for next business day delivery. Same-day delivery is
          not available for wholesale orders.
        </p>
        <p>
          Delivery is free for all qualifying wholesale orders meeting the 100 kg minimum. You
          must ensure that your delivery address is accessible and safe for our drivers. If a
          delivery cannot be completed due to unsafe conditions, inaccessibility, or failure to
          receive, a redelivery fee may apply.
        </p>
        <p>
          Products are transported in temperature-controlled coolers to maintain freshness and
          food safety compliance throughout transit.
        </p>
        <p>
          WeDoHalal is not liable for delays caused by weather, traffic, or other circumstances
          outside our direct control. We will notify you via WhatsApp if a significant delay is
          anticipated.
        </p>
      </LegalSection>

      <LegalSection id="tc-7" num="7" title="Substitutions">
        <p>
          In cases of stock unavailability, WeDoHalal may substitute an ordered item with an
          equivalent product of the same or comparable quality, cut, and halal certification at
          the same price. We will always notify you of any substitution before dispatch.
        </p>
        <p>
          You have the right to refuse a substitution. If refused, the item will be removed from
          your order and your invoice adjusted accordingly. You will not be charged for any
          removed item.
        </p>
        <LegalCallout tone="key" icon="📋">
          All substitutions are logged in your order&rsquo;s revision history, visible in the
          Order Detail screen of your account.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="tc-8" num="8" title="Cancellations and refunds">
        <p>
          Due to the perishable nature of meat products, cancellations are only accepted if
          requested before 8:00 AM on the scheduled dispatch date. Cancellations after packing
          begins may incur a restocking fee of up to 10% of the order value.
        </p>
        <p>Refunds or credits are issued in the following circumstances:</p>
        <ul>
          <li>Wrong items delivered</li>
          <li>
            Items damaged at the time of delivery (must be reported within 1 hour of receipt with
            photographic evidence)
          </li>
          <li>Supplier unavailability where no suitable substitution is available</li>
          <li>WeDoHalal-initiated order cancellation</li>
        </ul>
        <p>
          Refunds will not be issued for change of mind, failure to inspect orders at delivery, or
          reports made more than 1 hour after delivery. Approved refunds are processed within 5
          business days to the original payment method or as account credit at the customer&rsquo;s
          choice.
        </p>
      </LegalSection>

      <LegalSection id="tc-9" num="9" title="Halal compliance">
        <p>
          WeDoHalal sources exclusively from suppliers holding valid halal certification from
          recognised Islamic certifying bodies. Current certifications include ISNA Canada, HMC
          (UK), and IFANCA. Full certification details are available in the Halal Certifications
          section of the portal.
        </p>
        <p>
          WeDoHalal acts as a distribution facilitator. We do not manufacture, process, or certify
          products ourselves. Halal compliance responsibility rests with the supplying entity.
          Customers may request PDF copies of any certificate by contacting help@wedohalal.com.
        </p>
        <p>
          Fish and seafood are permissible (halal by default) under all major Islamic schools of
          thought and are sourced from reputable suppliers, but are not individually
          halal-certified.
        </p>
        <LegalCallout tone="info" icon="✓">
          All certificates are renewed annually. Expired certificates are removed from the
          platform immediately. You can view current certificate validity dates in the portal at
          any time.
        </LegalCallout>
      </LegalSection>

      <LegalSection id="tc-10" num="10" title="Limitation of liability">
        <p>
          WeDoHalal&rsquo;s total liability in connection with any order or account is limited to
          the value of that specific order. We are not liable for:
        </p>
        <ul>
          <li>Losses arising from product quality issues caused by a supplier</li>
          <li>Allergic reactions or dietary complications arising from product consumption</li>
          <li>Losses arising from delivery delays outside our direct control</li>
          <li>Indirect, consequential, or business losses of any kind</li>
        </ul>
        <p>
          By accepting these terms you acknowledge that all products are of a perishable nature
          and that you assume responsibility for safe handling, storage, and preparation following
          delivery.
        </p>
      </LegalSection>

      <LegalSection id="tc-11" num="11" title="Account termination">
        <p>
          WeDoHalal reserves the right to suspend or permanently terminate any wholesale account
          that:
        </p>
        <ul>
          <li>Fails to pay outstanding invoices within agreed terms</li>
          <li>Provides false or misleading account information</li>
          <li>Repeatedly cancels confirmed orders</li>
          <li>Engages in abusive or fraudulent activity</li>
        </ul>
        <p>
          Account holders may request deletion of their account at any time through the Business
          Profile settings. Outstanding balances must be settled prior to account closure.
        </p>
      </LegalSection>

      <LegalSection id="tc-12" num="12" title="Governing law">
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of
          Alberta, Canada. Any disputes arising from or in connection with these terms shall be
          subject to the exclusive jurisdiction of the courts of Edmonton, Alberta.
        </p>
        <p>
          WeDoHalal aims to resolve all disputes informally through direct communication. Please
          contact us at{" "}
          <a href="mailto:help@wedohalal.com">help@wedohalal.com</a> before initiating formal
          proceedings.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
