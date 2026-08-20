import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getInvoiceSummary } from "@/lib/db/queries/account";
import { formatDate, formatMoney } from "@/lib/format";
import { AccountHeader } from "@/components/portal/AccountHeader";
import { PaidBadge } from "@/components/portal/OrderStatusBadge";
import { NoticeCard } from "@/components/ui/NoticeCard";

export default async function InvoicesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const summary = await getInvoiceSummary(session.userId);

  return (
    <div className="pb-8">
      <AccountHeader title="Invoices and statements" subtitle="Download PDF invoices" />

      {summary.nextDue && (
        <div className="mx-4 mt-3.5 mb-1 flex items-center gap-3.5 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4 lg:mx-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-amber-300 bg-amber-50 text-[1.3rem]">
            ⏰
          </div>
          <div className="flex-1">
            <div className="mb-0.5 text-[0.9rem] font-extrabold text-neutral-900">
              {formatMoney(summary.outstandingBalance)} outstanding
            </div>
            <div className="text-[0.76rem] font-semibold text-amber-700">
              Invoice #{summary.nextDue.invoiceNumber} due {formatDate(summary.nextDue.dueDate)}
            </div>
          </div>
          <a
            href="mailto:payments@wedohalal.com"
            className="shrink-0 rounded-[9px] bg-primary-500 px-3 py-1.75 text-[0.76rem] font-extrabold text-white hover:bg-primary-600"
          >
            Pay now
          </a>
        </div>
      )}

      <div className="px-4 pt-3.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Invoices
      </div>
      {summary.invoices.length === 0 ? (
        <div className="mx-4 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-6 text-center text-[0.86rem] text-neutral-400 lg:mx-0">
          No invoice/terms orders yet — orders paid by card or COD don&apos;t generate an invoice.
        </div>
      ) : (
        <div className="mx-4 mb-1 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
          {summary.invoices.map((inv) => (
            <div key={inv.invoiceNumber} className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[9px] bg-neutral-100 text-[1.1rem]">
                📄
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[0.86rem] font-extrabold text-neutral-900">
                  {inv.invoiceNumber}
                </div>
                <div className="text-[0.72rem] text-neutral-400">
                  {formatDate(inv.createdAt)} · Order #{inv.orderNumber}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="mb-0.75 font-serif text-[0.95rem] font-bold text-neutral-900">
                  {formatMoney(inv.amount)}
                </div>
                <PaidBadge paid={inv.paid} dueDate={formatDate(inv.dueDate)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 pt-3.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Monthly statements
      </div>
      {summary.statements.length === 0 ? (
        <div className="mx-4 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-6 text-center text-[0.86rem] text-neutral-400 lg:mx-0">
          Statements appear here after your first order.
        </div>
      ) : (
        <div className="mx-4 mb-1 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
          {summary.statements.map((s) => (
            <div key={`${s.month}-${s.year}`} className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[9px] bg-neutral-100 text-[1.1rem]">
                📊
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[0.86rem] font-extrabold text-neutral-900">
                  {s.month} {s.year}
                </div>
                <div className="text-[0.72rem] text-neutral-400">
                  {s.orderCount} order{s.orderCount === 1 ? "" : "s"}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="mb-0.75 font-serif text-[0.95rem] font-bold text-neutral-900">
                  {formatMoney(s.total)}
                </div>
                <span className="text-[0.72rem] font-bold text-neutral-300">PDF unavailable</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 pt-2 lg:px-0">
        <NoticeCard icon="📩" title="Need a custom date range?">
          Email{" "}
          <a href="mailto:help@wedohalal.com" className="font-bold text-primary-500">
            help@wedohalal.com
          </a>{" "}
          with the date range and we&apos;ll generate a custom statement within one business day.
        </NoticeCard>
      </div>
    </div>
  );
}
