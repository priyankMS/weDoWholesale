import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getStripe } from "@/lib/stripe";
import { getOrderByNumber } from "@/lib/db/queries/orders";
import { User } from "@/lib/db/models/User";
import { ClearCartOnMount } from "@/components/portal/ClearCartOnMount";
import { WhatsNextSteps } from "@/components/portal/WhatsNextSteps";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; session_id?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { order: orderNumber, session_id: stripeSessionId } = await searchParams;

  if (!orderNumber || !stripeSessionId) {
    return <ErrorCard message="Missing order or payment reference." />;
  }

  let verified = false;
  try {
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
    verified =
      checkoutSession.payment_status === "paid" &&
      checkoutSession.metadata?.orderNumber === orderNumber;
  } catch {
    verified = false;
  }

  if (!verified) {
    return (
      <ErrorCard message="We couldn't verify this payment. If you completed checkout on Stripe, contact us and we'll confirm your order manually." />
    );
  }

  // Stripe confirms payment server-to-server via the webhook
  // (app/api/webhooks/stripe), which is the only thing that writes
  // paymentStatus/receipt data — this page just waits briefly for it to
  // land rather than trusting the client redirect to mark anything paid.
  let order = await getOrderByNumber(session.userId, orderNumber);
  for (let attempt = 0; attempt < 5 && order?.paymentStatus === "Pending"; attempt++) {
    await new Promise((r) => setTimeout(r, 600));
    order = await getOrderByNumber(session.userId, orderNumber);
  }
  const user = await User.findByPk(session.userId);

  if (!order) {
    return <ErrorCard message="Order not found on your account." />;
  }

  if (order.paymentStatus === "Pending") {
    return (
      <div className="mx-4 mt-6 mb-8 max-w-md rounded-2xl border-[1.5px] border-neutral-200 bg-white p-6 text-center lg:mx-auto">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-2xl">
          ⏳
        </div>
        <div className="mb-1.5 font-serif text-[1.1rem] font-black text-neutral-900">
          Confirming your payment…
        </div>
        <div className="mb-5 text-[0.86rem] leading-relaxed text-neutral-500">
          Stripe confirmed your card payment — we&rsquo;re just finishing up on our end.
          You&rsquo;ll see this order marked Paid on your account shortly, and we&rsquo;ll email
          you a confirmation.
        </div>
        <Link
          href="/account/orders"
          className="inline-block rounded-full bg-primary-500 px-5 py-2.5 text-[0.86rem] font-bold text-white hover:bg-primary-600"
        >
          View order history →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-4 mb-8 max-w-lg lg:mx-auto">
      <ClearCartOnMount />
      <div className="rounded-2xl border-[1.5px] border-neutral-200 bg-white p-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-[1.6rem] text-green-600">
          ✓
        </div>
        <div className="mb-1 font-serif text-[1.35rem] font-black text-neutral-900">
          Payment received!
        </div>
        <div className="mb-4 text-[0.86rem] text-neutral-500">
          Your card payment went through (Stripe test mode) and your order is confirmed.
        </div>
        <div className="mb-4 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 text-left">
          <div className="flex items-center justify-between border-b border-neutral-200 bg-primary-50 px-4 py-2.5">
            <span className="font-serif font-black text-neutral-900">#{order.orderNumber}</span>
            <span className="rounded-full bg-primary-500 px-2.5 py-0.75 text-[0.66rem] font-bold text-white">
              Paid
            </span>
          </div>
          {[
            ["Business", user?.businessName ?? "—"],
            ["Delivery date", order.deliveryDate ?? "—"],
            ["Window", order.timeSlot ?? "—"],
            ["Payment", "Card (Stripe)"],
            ["Total charged", `$${order.finalAmount.toFixed(2)}`],
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

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="mx-4 mt-6 mb-8 max-w-md rounded-2xl border-[1.5px] border-neutral-200 bg-white p-6 text-center lg:mx-auto">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl">
        ⚠️
      </div>
      <div className="mb-1.5 font-serif text-[1.1rem] font-black text-neutral-900">
        Something went wrong
      </div>
      <div className="mb-5 text-[0.86rem] leading-relaxed text-neutral-500">{message}</div>
      <Link
        href="/cart"
        className="inline-block rounded-full bg-primary-500 px-5 py-2.5 text-[0.86rem] font-bold text-white hover:bg-primary-600"
      >
        ← Back to cart
      </Link>
    </div>
  );
}
