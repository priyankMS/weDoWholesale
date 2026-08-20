import Stripe from "stripe";

// Test-mode only for now — see STRIPE_SECRET_KEY in .env.example. Lazily
// constructed (not at module load) so the app still boots without a key
// configured; only the checkout-by-card path needs it.
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set — add a Stripe test secret key (sk_test_...) to .env.local to enable card checkout.",
    );
  }
  return new Stripe(key);
}
