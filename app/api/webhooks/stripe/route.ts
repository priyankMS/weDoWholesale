import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { markOrderPaidFromStripe, markOrderPaymentFailed, notifyOrderConfirmed } from "@/lib/db/queries/orders";
import { logStripeWebhookEvent } from "@/lib/db/queries/stripeWebhookLogs";


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

  let orderNumber: string | null = null;
  let logStatus: "processed" | "ignored" = "ignored";

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        orderNumber = session.metadata?.orderNumber ?? null;
        if (orderNumber && session.payment_status === "paid") {
          await handlePaid(stripe, session.id, orderNumber);
          logStatus = "processed";
        }
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        orderNumber = session.metadata?.orderNumber ?? null;
        if (orderNumber) {
          await markOrderPaymentFailed(orderNumber);
          logStatus = "processed";
        }
        break;
      }
    }
  } catch (err) {
    // Logged before rethrowing — the 500 below still stands so Stripe
    // retries the event (order-state writes are idempotent, see the
    // comment above), this just also leaves a record of what failed.
    await logWebhookEventSafely({
      eventId: event.id,
      eventType: event.type,
      status: "error",
      orderNumber,
      errorMessage: (err as Error).message,
    });
    throw err;
  }

  await logWebhookEventSafely({
    eventId: event.id,
    eventType: event.type,
    status: logStatus,
    orderNumber,
  });

  // Stripe waits up to 10s for this response when a success_url is set,
  // then redirects the customer — everything above must stay fast, and
  // the response should be sent before any further slow work if that
  // ever changes (see "Quickly return a 2xx response" in Stripe's docs).
  return NextResponse.json({ received: true });
}

// Every event that reaches this webhook gets a row (see
// /api/cron/cleanup-webhook-logs for the 15-day retention) — a logging
// failure must never turn into a webhook 500 (which would make Stripe
// retry an event that actually succeeded).
async function logWebhookEventSafely(input: Parameters<typeof logStripeWebhookEvent>[0]) {
  try {
    await logStripeWebhookEvent(input);
  } catch (err) {
    console.error(`[stripe-webhook] Failed to log event ${input.eventId}:`, err);
  }
}

async function handlePaid(stripe: Stripe, sessionId: string, orderNumber: string) {
  const fullSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent.latest_charge"],
  });
  const paymentIntent = fullSession.payment_intent as Stripe.PaymentIntent | null;
  const charge = paymentIntent?.latest_charge as Stripe.Charge | null | undefined;
  const cardDetails = charge?.payment_method_details?.card;

  const justPaid = await markOrderPaidFromStripe(orderNumber, {
    stripeSessionId: fullSession.id,
    stripePaymentIntentId: paymentIntent?.id ?? null,
    receiptUrl: charge?.receipt_url ?? null,
    paidAt: new Date(),
    cardBrand: cardDetails?.brand ?? null,
    cardLast4: cardDetails?.last4 ?? null,
  });

  // Confirmation email is enqueued, not awaited inline — Stripe's 10s
  // response budget (see the comment on the POST handler above) shouldn't
  // stretch to cover a DB read + queue publish, and a failure here must
  // never turn into a webhook 500 (which would make Stripe retry the whole
  // event, including the now-redundant payment-status update).
  if (justPaid) {
    notifyOrderConfirmed(orderNumber).catch((err) =>
      console.error(`[stripe-webhook] Failed to send order confirmation for ${orderNumber}:`, err),
    );
  }
}
