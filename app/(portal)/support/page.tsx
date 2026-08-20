import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { OrderLookupCard } from "@/components/portal/OrderLookupCard";
import { FaqAccordion } from "@/components/ui/FaqAccordion";

const FAQ = [
  {
    question: "What is the minimum order for delivery?",
    answer:
      "The minimum order for wholesale delivery is 100 kg total weight. If your order is below this threshold, a pickup option is available from our Edmonton warehouse.",
  },
  {
    question: "Can I change or cancel an order after placing it?",
    answer:
      "All wholesale orders are binding once placed. Changes may be possible if requested before 8 AM on the day of dispatch. Contact us immediately via WhatsApp. Cancellations after packing begins may incur a restocking fee.",
  },
  {
    question: "What happens if an item is out of stock?",
    answer:
      "We will notify you via WhatsApp and the portal inbox before dispatch. We will either substitute with an equivalent item (same cut, similar origin, same certification) at the same price, or remove it and adjust your invoice. You always have the right to refuse a substitution.",
  },
  {
    question: "How do I apply for Net 30 payment terms?",
    answer:
      "Email help@wedohalal.com with your business name, account ID, and a brief note on your average monthly volume. Our team reviews term upgrade requests within 2 business days and will contact you directly.",
  },
  {
    question: "Do you deliver to Calgary?",
    answer:
      "Calgary wholesale delivery is in active development. We currently deliver across Edmonton and surrounding communities (Sherwood Park, St. Albert, Spruce Grove, Fort Saskatchewan, Leduc, Nisku, Devon, Beaumont). Contact us to be added to the Calgary waitlist.",
  },
  {
    question: "How do I get a copy of a halal certificate?",
    answer:
      "PDF copies of all supplier halal certificates are available on request. Email help@wedohalal.com with your account name and which certification you need. We'll send it within one business day.",
  },
];

const HOURS = [
  { day: "Monday – Friday", hours: "9 AM – 7 PM MST", open: true },
  { day: "Saturday", hours: "9 AM – 5 PM MST", open: true },
  { day: "Sunday", hours: "Emergency orders only", open: false },
];

// Screen 30 — Contact / Support.
export default async function SupportPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="pb-8 lg:px-6 lg:pt-6">
      <div className="border-b-[1.5px] border-neutral-200 bg-white px-4.5 py-3.5 lg:hidden">
        <div className="font-serif text-[1.3rem] font-black text-neutral-900">
          WeDoHalal<span className="text-primary-500">.</span>
        </div>
        <div className="mt-0.5 text-[0.7rem] font-semibold text-neutral-400">
          Contact and support
        </div>
      </div>

      <div className="relative mx-4 mt-3.5 overflow-hidden rounded-2xl bg-primary-500 px-5 py-5.5 text-white lg:mx-0">
        <div className="mb-1.25 text-[0.66rem] font-extrabold tracking-widest uppercase opacity-80">
          We&rsquo;re here for you
        </div>
        <div className="mb-1.5 font-serif text-[1.3rem] font-black leading-tight">
          How can we help?
        </div>
        <div className="max-w-100 text-[0.8rem] leading-relaxed opacity-90">
          Fastest way to reach us is WhatsApp. For billing and order issues, include your order
          number.
        </div>
      </div>

      <div className="px-4 pt-4 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Contact us
      </div>
      <div className="flex flex-col gap-2.5 px-4 lg:grid lg:grid-cols-3 lg:px-0">
        <a
          href="https://wa.me/17807227623?text=Hi%20WeDoHalal%2C%20I%20have%20a%20question%20about%20my%20wholesale%20account."
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3.5 rounded-2xl border-[1.5px] border-[#25D366] bg-white p-4.5 hover:bg-neutral-50"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e8f9ee] text-[1.5rem]">
            💬
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[0.92rem] font-extrabold text-neutral-900">WhatsApp</div>
            <div className="text-[0.74rem] leading-relaxed text-neutral-400">
              +1 (780) 722-7623
              <br />
              Fastest response · Real-time replies
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-green-200 bg-green-50 px-2.25 py-0.75 text-[0.66rem] font-extrabold whitespace-nowrap text-green-600">
            Fastest
          </span>
        </a>

        <a
          href="mailto:help@wedohalal.com"
          className="flex items-center gap-3.5 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4.5 hover:bg-neutral-50"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[1.5rem]">
            ✉️
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[0.92rem] font-extrabold text-neutral-900">Email</div>
            <div className="text-[0.74rem] leading-relaxed text-neutral-400">
              help@wedohalal.com
              <br />
              Response within 24 hours
            </div>
          </div>
          <span className="shrink-0 text-neutral-300">›</span>
        </a>

        <Link
          href="/messages/new"
          className="flex items-center gap-3.5 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4.5 hover:bg-neutral-50"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-[1.5rem]">
            💬
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[0.92rem] font-extrabold text-neutral-900">Send a message</div>
            <div className="text-[0.74rem] leading-relaxed text-neutral-400">
              Message us inside the portal
              <br />
              Order linked for fast lookup
            </div>
          </div>
          <span className="shrink-0 text-neutral-300">›</span>
        </Link>
      </div>

      <div className="px-4 pt-4 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Order lookup
      </div>
      <div className="px-4 lg:px-0">
        <OrderLookupCard />
      </div>

      <div className="px-4 pt-4 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Support hours
      </div>
      <div className="mx-4 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
        {HOURS.map((h) => (
          <div key={h.day} className="flex items-center justify-between gap-2 px-4 py-3">
            <span className="text-[0.84rem] font-bold text-neutral-900">{h.day}</span>
            <span className="text-[0.78rem] font-medium text-neutral-400">{h.hours}</span>
            <span
              className={`shrink-0 rounded-full px-2.25 py-0.5 text-[0.66rem] font-extrabold ${
                h.open ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {h.open ? "Open" : "Limited"}
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 pt-4 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Common questions
      </div>
      <div className="px-4 lg:px-0">
        <FaqAccordion items={FAQ} />
      </div>
    </div>
  );
}
