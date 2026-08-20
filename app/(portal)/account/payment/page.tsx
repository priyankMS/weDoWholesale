import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getPaymentSummary } from "@/lib/db/queries/account";
import { formatDate, formatMoney, paymentTermsLabel } from "@/lib/format";
import { AccountHeader } from "@/components/portal/AccountHeader";
import { NoticeCard } from "@/components/ui/NoticeCard";

export default async function PaymentPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const summary = await getPaymentSummary(session.userId);
  const hasTerms = summary.paymentTerms === "net15" || summary.paymentTerms === "net30";

  return (
    <div className="pb-8">
      <AccountHeader title="Payment methods" subtitle="Terms, credit limit and how you pay" />

      <div className="px-4 pt-3.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Payment terms status
      </div>
      <div className="mx-4 mb-1 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4.5 lg:mx-0">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border text-[1.4rem] ${
              hasTerms ? "border-green-200 bg-green-50" : "border-neutral-200 bg-neutral-100"
            }`}
          >
            📅
          </div>
          <div className="flex-1">
            <div className="mb-0.5 text-[0.95rem] font-extrabold text-neutral-900">
              {hasTerms
                ? `${paymentTermsLabel(summary.paymentTerms)} terms approved`
                : "No credit terms yet — COD / card only"}
            </div>
            <div className="text-[0.76rem] leading-relaxed text-neutral-500">
              {hasTerms
                ? `Pay within ${summary.paymentTerms === "net30" ? "30" : "15"} days of delivery. Invoices emailed automatically after each order.`
                : "Ask us about Net 15 / Net 30 terms once you've placed a few orders."}
            </div>
          </div>
          {hasTerms && (
            <span className="shrink-0 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[0.7rem] font-extrabold text-green-600">
              Active
            </span>
          )}
        </div>

        {hasTerms && (
          <>
            <div className="mt-3.5 grid grid-cols-2 gap-2.5 border-t border-neutral-200 pt-3">
              <div className="text-center">
                <div className="font-serif text-[1.2rem] font-black text-neutral-900">
                  {summary.creditLimit != null ? formatMoney(summary.creditLimit) : "—"}
                </div>
                <div className="mt-0.25 text-[0.66rem] font-semibold text-neutral-400">
                  Credit limit
                </div>
              </div>
              <div className="text-center">
                <div className="font-serif text-[1.2rem] font-black text-neutral-900">
                  {formatMoney(summary.outstandingBalance)}
                </div>
                <div className="mt-0.25 text-[0.66rem] font-semibold text-neutral-400">
                  Outstanding balance
                </div>
              </div>
            </div>
            {summary.nextDue && (
              <div className="mt-3 rounded-[10px] border border-amber-300 bg-amber-50 px-3 py-2.5 text-[0.78rem] font-semibold text-amber-700">
                ⏰ Invoice #{summary.nextDue.invoiceNumber} due by{" "}
                {formatDate(summary.nextDue.dueDate)} — {formatMoney(summary.nextDue.amount)}
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-4 pt-3.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Saved payment methods
      </div>

      <div className="mx-4 mb-2.5 flex items-center gap-3.5 rounded-2xl border-[1.5px] border-primary-500 bg-white p-4 lg:mx-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-neutral-100 text-[1.5rem]">
          🧾
        </div>
        <div className="flex-1">
          <div className="mb-0.5 text-[0.9rem] font-extrabold text-neutral-900">
            Invoice on delivery
          </div>
          <div className="text-[0.76rem] text-neutral-400">
            {hasTerms
              ? `Default · ${paymentTermsLabel(summary.paymentTerms)} terms · PDF invoice emailed`
              : "Pay by E-Transfer within 5 days of delivery"}
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-[0.66rem] font-extrabold text-primary-600">
          Default
        </span>
      </div>

      <div className="mx-4 mb-2.5 flex items-center gap-3.5 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4 lg:mx-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-neutral-100 text-[1.5rem]">
          📲
        </div>
        <div className="flex-1">
          <div className="mb-0.5 text-[0.9rem] font-extrabold text-neutral-900">E-Transfer</div>
          <div className="text-[0.76rem] text-neutral-400">payments@wedohalal.com</div>
        </div>
      </div>

      <div className="px-4 pt-1 pb-1 lg:px-0">
        <a
          href="mailto:help@wedohalal.com?subject=Payment terms upgrade request"
          className="block w-full rounded-xl border-[1.5px] border-neutral-200 bg-white py-3.25 text-center text-[0.9rem] font-bold text-neutral-700 hover:bg-neutral-50"
        >
          Request terms upgrade to Net 30
        </a>
      </div>

      <div className="px-4 pt-2 lg:px-0">
        <NoticeCard icon="📩" title="Need to adjust your terms?">
          To request a credit limit increase or Net 30 terms, email{" "}
          <a href="mailto:help@wedohalal.com" className="font-bold text-primary-500">
            help@wedohalal.com
          </a>
          . Our team reviews requests within 2 business days.
        </NoticeCard>
      </div>
    </div>
  );
}
