import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createOrderSchema } from "@/lib/validation/orders";
import { createOrder, markOrderPaymentFailed, OrderError } from "@/lib/db/queries/orders";
import { getPlatformSettings } from "@/lib/db/queries/settings";
import { Order } from "@/lib/db/models/Order";
import { getStripe } from "@/lib/stripe";

// Creates the order first (payment_status "Pending"), then a Stripe test-
// mode Checkout Session for its exact total. /checkout/success verifies
// the session and flips the order to "Completed" once Stripe confirms
// payment — this route never marks anything paid itself.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Order confirmation email is NOT sent here — this order is unpaid
  // ("Pending") until Stripe confirms it. It's sent from the webhook's
  // handlePaid() once payment actually succeeds (see
  // app/api/webhooks/stripe/route.ts).
  let receipt;
  try {
    receipt = await createOrder(session.userId, parsed.data);
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const settings = await getPlatformSettings();

  // From here on, any failure must flip the order out of "Pending" instead
  // of leaving it stuck — nothing below this point ever charges the
  // customer (Stripe only takes payment once they submit card details on
  // the Checkout page itself), so a failure here always means no money
  // moved and the order is correctly cancelled rather than left as a
  // phantom order the customer can't see or retry.
  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    await markOrderPaymentFailed(receipt.orderNumber);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const origin = new URL(request.url).origin;

  let checkoutSession;
  try {
    checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "cad",
              product_data: { name: `WeDoHalal Wholesale order #${receipt.orderNumber}` },
              unit_amount: Math.round(receipt.subtotal * 100),
            },
            quantity: 1,
          },
          {
            price_data: {
              currency: "cad",
              product_data: { name: `GST (${settings.gstRatePercent}%)` },
              unit_amount: Math.round(receipt.gstAmount * 100),
            },
            quantity: 1,
          },
        ],
        metadata: { orderNumber: receipt.orderNumber },
        success_url: `${origin}/checkout/success?order=${receipt.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout`,
      },
      // Ties this Stripe call to this one order, so a network blip that
      // makes our own code (or a future retry) call create() twice for the
      // same order reuses the first Checkout Session instead of minting a
      // second one — never two payable links, never a double charge.
      { idempotencyKey: `checkout-session:${receipt.orderNumber}` },
    );
  } catch {
    await markOrderPaymentFailed(receipt.orderNumber);
    return NextResponse.json(
      { error: "We couldn't reach Stripe to start checkout. No payment was taken — please try again." },
      { status: 502 },
    );
  }

  if (!checkoutSession.url) {
    await markOrderPaymentFailed(receipt.orderNumber);
    return NextResponse.json({ error: "Could not start Stripe checkout." }, { status: 500 });
  }

  try {
    await Order.update(
      { stripeSessionId: checkoutSession.id },
      { where: { orderNumber: receipt.orderNumber } },
    );
  } catch (err) {
    // Not fatal: the customer already has a valid, payable Stripe URL, and
    // the webhook writes stripeSessionId again once payment completes
    // (markOrderPaidFromStripe matches on orderNumber, not this column) —
    // failing the request here would throw away a working checkout link
    // over a redundant write.
    console.error(`[stripe-session] Failed to store session id for ${receipt.orderNumber}:`, err);
  }

  return NextResponse.json({ url: checkoutSession.url });
}
