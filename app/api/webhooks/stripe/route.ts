import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { markOrderPaidFromStripe, markOrderPaymentFailed } from "@/lib/db/queries/orders";

// Source of truth for payment confirmation — Stripe calls this server-to-
// server once a Checkout Session completes, so unlike the /checkout/success
// redirect (which the browser could hit with a guessed order/session id)
// this is verified via the signed webhook payload.
//
// Handles all three terminal states a Checkout Session can reach per
// https://docs.stripe.com/checkout/fulfillment: paid (completed, or
// async_payment_succeeded for delayed methods like ACH), and never-paid
// (async_payment_failed for a delayed method that failed, or expired for
// an abandoned session) — otherwise an unpaid order is left stuck "Pending"
// forever with no record anything went wrong.
//
// markOrderPaidFromStripe / markOrderPaymentFailed both guard on
// `WHERE paymentStatus = 'Pending'`, so redelivery of the same event
// (Stripe's at-least-once delivery) is a safe no-op.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  const stripe = getStripe();
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderNumber = session.metadata?.orderNumber;
      if (orderNumber && session.payment_status === "paid") {
        await handlePaid(stripe, session.id, orderNumber);
      }
      break;
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderNumber = session.metadata?.orderNumber;
      if (orderNumber) {
        await markOrderPaymentFailed(orderNumber);
      }
      break;
    }
  }

  // Stripe waits up to 10s for this response when a success_url is set,
  // then redirects the customer — everything above must stay fast, and
  // the response should be sent before any further slow work if that
  // ever changes (see "Quickly return a 2xx response" in Stripe's docs).
  return NextResponse.json({ received: true });
}

async function handlePaid(stripe: Stripe, sessionId: string, orderNumber: string) {
  const fullSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent.latest_charge"],
  });
  const paymentIntent = fullSession.payment_intent as Stripe.PaymentIntent | null;
  const charge = paymentIntent?.latest_charge as Stripe.Charge | null | undefined;
  const cardDetails = charge?.payment_method_details?.card;

  await markOrderPaidFromStripe(orderNumber, {
    stripeSessionId: fullSession.id,
    stripePaymentIntentId: paymentIntent?.id ?? null,
    receiptUrl: charge?.receipt_url ?? null,
    paidAt: new Date(),
    cardBrand: cardDetails?.brand ?? null,
    cardLast4: cardDetails?.last4 ?? null,
  });
}
