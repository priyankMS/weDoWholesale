import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createOrderSchema } from "@/lib/validation/orders";
import { createOrder, OrderError } from "@/lib/db/queries/orders";
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

  // TODO(Phase 7 — Email Templates): once this checkout flow is finalized,
  // send the order confirmation email here (or from /checkout/success once
  // Stripe confirms payment) using orderConfirmationEmail() from
  // lib/email/templates — template is built and ready, just not wired in
  // while checkout itself is still being iterated on.
  let receipt;
  try {
    receipt = await createOrder(session.userId, parsed.data);
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const origin = new URL(request.url).origin;

  const checkoutSession = await stripe.checkout.sessions.create({
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
          product_data: { name: "GST (5%)" },
          unit_amount: Math.round(receipt.gstAmount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { orderNumber: receipt.orderNumber },
    success_url: `${origin}/checkout/success?order=${receipt.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
  });

  if (!checkoutSession.url) {
    return NextResponse.json({ error: "Could not start Stripe checkout." }, { status: 500 });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
