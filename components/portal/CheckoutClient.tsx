"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/CartContext";
import { placeOrder, startStripeCheckout, type OrderReceipt } from "@/lib/api/orders";
import { getApiErrorMessage } from "@/lib/api/error";
import { DELIVERY_WINDOWS, PAYMENT_OPTIONS } from "@/lib/validation/orders";
import { WhatsNextSteps } from "@/components/portal/WhatsNextSteps";

type DeliveryMethod = "delivery" | "pickup";
type DeliveryWindow = (typeof DELIVERY_WINDOWS)[number];
type PaymentOption = (typeof PAYMENT_OPTIONS)[number];
type Step = "delivery" | "payment" | "review";

const CITIES = [
  "Edmonton",
  "Calgary",
  "Sherwood Park",
  "St. Albert",
  "Spruce Grove",
  "Fort Saskatchewan",
  "Leduc",
  "Other Alberta city",
];

const WINDOW_LABEL: Record<DeliveryWindow, string> = {
  morning: "Morning (8 AM – 12 PM)",
  afternoon: "Afternoon (12 PM – 5 PM)",
};

const PAYMENT_META: Record<
  PaymentOption,
  { icon: string; label: string; desc: string; note?: string }
> = {
  card: {
    icon: "💳",
    label: "Card (Stripe test)",
    desc: "Pay now by card — you'll be sent to Stripe's test checkout",
  },
  cod: {
    icon: "💵",
    label: "Cash on delivery",
    desc: "Pay the driver when your order arrives",
    note: "A 2% cash-handling surcharge applies.",
  },
  e_transfer: {
    icon: "📲",
    label: "E-Transfer",
    desc: "Send payment to payments@wedohalal.com before delivery",
  },
  invoice: {
    icon: "🧾",
    label: "Invoice",
    desc: "Invoice sent with your delivery, payable on receipt",
  },
  net_terms: {
    icon: "📅",
    label: "Net 15 / Net 30",
    desc: "For approved accounts — contact us to set up terms",
  },
};

const GST_RATE = 0.05;
const COD_RATE = 0.02;

const TERMS_LABEL: Record<"net15" | "net30", string> = {
  net15: "Net 15",
  net30: "Net 30",
};
const TERMS_DAYS: Record<"net15" | "net30", number> = { net15: 15, net30: 30 };

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const STEPS: { key: Step; label: string }[] = [
  { key: "delivery", label: "Delivery" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
];

export function CheckoutClient({
  account,
}: {
  account: {
    businessName: string | null;
    city: string | null;
    businessAddress: string | null;
    phone: string | null;
    paymentTerms: "cod" | "net15" | "net30" | null;
  };
}) {
  const router = useRouter();
  const { items, ready, subtotal, clear } = useCart();

  const [step, setStep] = useState<Step>("delivery");
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  const [method, setMethod] = useState<DeliveryMethod>("delivery");
  const [business, setBusiness] = useState(account.businessName ?? "");
  const [street, setStreet] = useState(account.businessAddress ?? "");
  const [city, setCity] = useState(account.city ?? "");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState(account.phone ?? "");
  const [date, setDate] = useState(tomorrowISO());
  const [deliveryWindow, setDeliveryWindow] = useState<DeliveryWindow>("morning");
  const [notes, setNotes] = useState("");

  const [paymentOption, setPaymentOption] = useState<PaymentOption>("card");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && items.length === 0 && !receipt) router.replace("/cart");
  }, [ready, items.length, receipt, router]);

  const gst = subtotal * GST_RATE;
  const codCharges = paymentOption === "cod" ? (subtotal + gst) * COD_RATE : 0;
  const total = subtotal + gst + codCharges;

  const deliveryValid =
    business.trim() &&
    phone.trim() &&
    date &&
    (method === "pickup" || (street.trim() && city.trim()));

  async function handlePlaceOrder() {
    setSubmitting(true);
    setError(null);
    const orderInput = {
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty })),
      delivery: { method, business, street, city, postalCode, phone, date, window: deliveryWindow, notes },
      paymentOption,
    };
    try {
      if (paymentOption === "card") {
        // Cart is cleared on /checkout/success once Stripe confirms
        // payment, not here — the browser is about to leave the app.
        const { url } = await startStripeCheckout(orderInput);
        window.location.href = url;
        return;
      }
      const result = await placeOrder(orderInput);
      clear();
      setReceipt(result);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (receipt) {
    return (
      <div className="mx-4 mt-4 mb-8 max-w-lg lg:mx-auto">
        <div className="rounded-2xl border-[1.5px] border-neutral-200 bg-white p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-[1.6rem] text-green-600">
            ✓
          </div>
          <div className="mb-1 font-serif text-[1.35rem] font-black text-neutral-900">
            Order placed!
          </div>
          <div className="mb-4 text-[0.86rem] text-neutral-500">
            Your order has been received and is being prepared. We&apos;ll confirm via WhatsApp
            shortly.
          </div>
          <div className="mb-4 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 text-left">
            <div className="flex items-center justify-between border-b border-neutral-200 bg-primary-50 px-4 py-2.5">
              <span className="font-serif font-black text-neutral-900">#{receipt.orderNumber}</span>
              <span className="rounded-full bg-primary-500 px-2.5 py-0.75 text-[0.66rem] font-bold text-white">
                Confirmed
              </span>
            </div>
            {[
              ["Business", business],
              ["Delivery date", date],
              ["Window", WINDOW_LABEL[deliveryWindow]],
              ["Payment", PAYMENT_META[paymentOption].label],
              ["Total", `$${receipt.finalAmount.toFixed(2)}`],
            ].map(([label, val]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5 text-[0.84rem] last:border-none"
              >
                <span className="text-neutral-500">{label}</span>
                <span className="font-bold text-neutral-900">{val}</span>
              </div>
            ))}
          </div>

          <WhatsNextSteps />

          <div className="flex flex-col gap-2">
            <a
              href="https://wa.me/17807227623"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-primary-500 py-3 text-[0.88rem] font-extrabold text-white hover:bg-primary-600"
            >
              💬 Message us on WhatsApp
            </a>
            <Link
              href="/catalogue"
              className="rounded-xl border-[1.5px] border-neutral-200 py-3 text-[0.88rem] font-bold text-neutral-700"
            >
              Back to shop
            </Link>
            <Link
              href="/account/orders"
              className="py-1.5 text-center text-[0.82rem] font-bold text-primary-500"
            >
              View order history →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (ready && items.length === 0) return null;

  return (
    <div className="mx-4 mt-4 mb-8 lg:mx-auto lg:max-w-lg">
      <div className="mb-4 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => {
          const idx = STEPS.findIndex((x) => x.key === step);
          const state = i < idx ? "done" : i === idx ? "active" : "todo";
          return (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] font-bold ${
                  state === "done"
                    ? "bg-primary-500 text-white"
                    : state === "active"
                      ? "border-2 border-primary-500 text-primary-500"
                      : "border-2 border-neutral-200 text-neutral-300"
                }`}
              >
                {state === "done" ? "✓" : i + 1}
              </div>
              <span
                className={`text-[0.76rem] font-bold ${state === "todo" ? "text-neutral-300" : "text-neutral-900"}`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && <span className="mx-1 h-px w-4 bg-neutral-200" />}
            </div>
          );
        })}
      </div>

      {step === "delivery" && (
        <div>
          <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Delivery method
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2.5">
            {(
              [
                { value: "delivery", icon: "🚚", label: "Delivery", sub: "Next business day" },
                { value: "pickup", icon: "🏪", label: "Pickup", sub: "Same day · our warehouse" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMethod(opt.value)}
                className={`rounded-2xl border-[1.5px] p-3.5 text-left ${
                  method === opt.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <div className="mb-1 text-[1.3rem]">{opt.icon}</div>
                <div className="text-[0.86rem] font-bold text-neutral-900">{opt.label}</div>
                <div className="text-[0.7rem] text-neutral-400">{opt.sub}</div>
              </button>
            ))}
          </div>

          {method === "delivery" ? (
            <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <label className="col-span-2 text-[0.78rem] font-semibold text-neutral-700">
                Business name
                <input
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  className="mt-1 w-full rounded-[10px] border-[1.5px] border-neutral-200 px-3 py-2.5 text-[0.88rem] outline-none focus:border-primary-500"
                />
              </label>
              <label className="col-span-2 text-[0.78rem] font-semibold text-neutral-700">
                Street address
                <input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="mt-1 w-full rounded-[10px] border-[1.5px] border-neutral-200 px-3 py-2.5 text-[0.88rem] outline-none focus:border-primary-500"
                />
              </label>
              <label className="text-[0.78rem] font-semibold text-neutral-700">
                City
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-[10px] border-[1.5px] border-neutral-200 bg-white px-3 py-2.5 text-[0.88rem] outline-none focus:border-primary-500"
                >
                  <option value="">Select</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[0.78rem] font-semibold text-neutral-700">
                Postal code
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="mt-1 w-full rounded-[10px] border-[1.5px] border-neutral-200 px-3 py-2.5 text-[0.88rem] outline-none focus:border-primary-500"
                />
              </label>
              <label className="col-span-2 text-[0.78rem] font-semibold text-neutral-700">
                Phone
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-[10px] border-[1.5px] border-neutral-200 px-3 py-2.5 text-[0.88rem] outline-none focus:border-primary-500"
                />
              </label>
            </div>
          ) : (
            <div className="mb-4 flex items-start gap-3 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-3.5">
              <span className="text-[1.2rem]">📍</span>
              <div>
                <div className="text-[0.86rem] font-bold text-neutral-900">
                  WeDoHalal Warehouse
                </div>
                <div className="text-[0.78rem] text-neutral-500">
                  Edmonton, AB — exact address shared via WhatsApp after order confirmation.
                </div>
                <div className="mt-1 text-[0.74rem] text-neutral-400">Mon – Sat · 8 AM – 4 PM</div>
              </div>
              <label className="ml-auto shrink-0 text-[0.78rem] font-semibold text-neutral-700">
                Phone
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-32 rounded-[10px] border-[1.5px] border-neutral-200 px-2.5 py-2 text-[0.84rem] outline-none focus:border-primary-500"
                />
              </label>
            </div>
          )}

          <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Preferred date
          </div>
          <input
            type="date"
            value={date}
            min={tomorrowISO()}
            onChange={(e) => setDate(e.target.value)}
            className="mb-4 w-full rounded-[10px] border-[1.5px] border-neutral-200 px-3 py-2.5 text-[0.88rem] outline-none focus:border-primary-500"
          />

          <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Delivery window
          </div>
          <div className="mb-4 flex gap-2">
            {DELIVERY_WINDOWS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setDeliveryWindow(w)}
                className={`flex-1 rounded-xl border-[1.5px] px-3 py-2.5 text-[0.8rem] font-semibold ${
                  deliveryWindow === w
                    ? "border-primary-500 bg-primary-500 text-white"
                    : "border-neutral-200 bg-white text-neutral-700"
                }`}
              >
                {WINDOW_LABEL[w]}
              </button>
            ))}
          </div>

          <label className="mb-5 block text-[0.78rem] font-semibold text-neutral-700">
            Special instructions (optional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-[10px] border-[1.5px] border-neutral-200 px-3 py-2.5 text-[0.88rem] outline-none focus:border-primary-500"
            />
          </label>

          <button
            type="button"
            disabled={!deliveryValid}
            onClick={() => setStep("payment")}
            className="w-full rounded-xl bg-primary-500 py-3.5 text-[0.92rem] font-extrabold text-white transition-colors disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            Continue to payment →
          </button>
        </div>
      )}

      {step === "payment" && (
        <div>
          <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Select payment method
          </div>
          <div className="mb-4 flex flex-col gap-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setPaymentOption(opt)}
                className={`flex items-start gap-3 rounded-2xl border-[1.5px] p-3.5 text-left ${
                  paymentOption === opt ? "border-primary-500 bg-primary-50" : "border-neutral-200 bg-white"
                }`}
              >
                <span className="text-[1.2rem]">{PAYMENT_META[opt].icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.86rem] font-bold text-neutral-900">
                    {PAYMENT_META[opt].label}
                  </div>
                  <div className="text-[0.76rem] text-neutral-500">{PAYMENT_META[opt].desc}</div>
                </div>
              </button>
            ))}
          </div>

          {PAYMENT_META[paymentOption].note && (
            <div className="mb-4 rounded-2xl border-[1.5px] border-amber-300 bg-amber-50 px-3.5 py-3 text-[0.8rem] text-amber-800">
              💵 {PAYMENT_META[paymentOption].note}
            </div>
          )}

          {paymentOption === "net_terms" &&
            (account.paymentTerms === "net15" || account.paymentTerms === "net30" ? (
              <div className="mb-4 rounded-2xl border-[1.5px] border-green-300 bg-green-50 px-3.5 py-3 text-[0.8rem] text-green-800">
                ✓ Your account is approved for {TERMS_LABEL[account.paymentTerms]} terms. An
                invoice will be emailed within 24 hours of delivery. Payment due within{" "}
                {TERMS_DAYS[account.paymentTerms]} days.
              </div>
            ) : (
              <div className="mb-4 rounded-2xl border-[1.5px] border-amber-300 bg-amber-50 px-3.5 py-3 text-[0.8rem] text-amber-800">
                ⏳ Your account isn&apos;t yet approved for terms — contact us to set them up.
                We&apos;ll follow up before confirming an order placed this way.
              </div>
            ))}

          <div className="mb-5 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4">
            {[
              ["Subtotal", subtotal],
              ["GST (5%)", gst],
              ...(codCharges > 0 ? [["COD surcharge (2%)", codCharges] as const] : []),
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between py-1 text-[0.84rem]">
                <span className="text-neutral-500">{label}</span>
                <span className="font-semibold text-neutral-900">${(val as number).toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-1.5 flex items-center justify-between border-t border-neutral-200 pt-2.5">
              <span className="font-bold text-neutral-900">Total</span>
              <span className="font-serif font-black text-primary-600">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setStep("delivery")}
              className="rounded-xl border-[1.5px] border-neutral-200 px-5 py-3.5 text-[0.86rem] font-bold text-neutral-700"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep("review")}
              className="flex-1 rounded-xl bg-primary-500 py-3.5 text-[0.92rem] font-extrabold text-white hover:bg-primary-600"
            >
              Review order →
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div>
          <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Items in this order
          </div>
          <div className="mb-4 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="flex items-center justify-between border-b border-neutral-100 px-3.5 py-2.5 text-[0.84rem] last:border-none"
              >
                <span className="pr-2 text-neutral-700">
                  {item.name} × {item.qty} {item.unit}
                </span>
                <span className="shrink-0 font-bold text-neutral-900">
                  ${(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mb-4 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white">
            {[
              ["Method", method === "delivery" ? "🚚 Delivery" : "🏪 Pickup"],
              ...(method === "delivery" ? [["Delivering to", `${business}, ${city}`] as const] : []),
              ["Date", date],
              ["Window", WINDOW_LABEL[deliveryWindow]],
              ["Payment", PAYMENT_META[paymentOption].label],
            ].map(([label, val]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-neutral-100 px-3.5 py-2.5 text-[0.84rem] last:border-none"
              >
                <span className="text-neutral-500">{label}</span>
                <span className="text-right font-bold text-neutral-900">{val}</span>
              </div>
            ))}
          </div>

          <div className="mb-4 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4">
            {[
              ["Subtotal", subtotal],
              ["GST (5%)", gst],
              ...(codCharges > 0 ? [["COD surcharge (2%)", codCharges] as const] : []),
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between py-1 text-[0.84rem]">
                <span className="text-neutral-500">{label}</span>
                <span className="font-semibold text-neutral-900">${(val as number).toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-1.5 flex items-center justify-between border-t border-neutral-200 pt-2.5">
              <span className="font-bold text-neutral-900">Total due</span>
              <span className="font-serif font-black text-primary-600">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-4 flex items-start gap-2.5 rounded-2xl border-[1.5px] border-amber-300 bg-amber-50 px-3.5 py-3 text-[0.78rem] text-amber-800">
            <span>⚖️</span>
            <span>
              By placing this order you agree to WeDoHalal&apos;s Wholesale Terms &amp;
              Conditions. Orders are binding once submitted. Substitutions may occur for
              out-of-stock items and you&apos;ll be notified immediately.
            </span>
          </div>

          <label className="mb-4 flex items-start gap-2.5 text-[0.82rem] text-neutral-700">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            I have reviewed my order and agree that it is binding once placed.
          </label>

          {error && (
            <div className="mb-4 rounded-xl border-[1.5px] border-red-200 bg-red-50 px-3.5 py-3 text-[0.82rem] text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setStep("payment")}
              disabled={submitting}
              className="rounded-xl border-[1.5px] border-neutral-200 px-5 py-3.5 text-[0.86rem] font-bold text-neutral-700 disabled:opacity-50"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={!agree || submitting}
              onClick={handlePlaceOrder}
              className="flex-1 rounded-xl bg-primary-500 py-3.5 text-[0.92rem] font-extrabold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {submitting
                ? paymentOption === "card"
                  ? "Redirecting to Stripe…"
                  : "Placing order…"
                : paymentOption === "card"
                  ? `Pay with card — $${total.toFixed(2)} →`
                  : `Place order — $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
