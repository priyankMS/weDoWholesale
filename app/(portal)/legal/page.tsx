import { redirect } from "next/navigation";

// No standalone "Legal hub" screen exists in the Phase 6 mockup — each
// document (Terms, Privacy, Delivery Policy) is reached directly (from
// AccountPage's new "Legal" menu section, or a document's own footer
// cross-links). This index simply lands on Terms & Conditions.
export default function LegalIndexPage() {
  redirect("/legal/terms");
}
