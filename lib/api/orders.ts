import { apiClient } from "@/lib/api/client";
import type { CreateOrderInput } from "@/lib/validation/orders";

export type OrderReceipt = {
  orderNumber: string;
  subtotal: number;
  gstAmount: number;
  codCharges: number;
  finalAmount: number;
};

export async function placeOrder(input: CreateOrderInput): Promise<OrderReceipt> {
  const res = await apiClient.post<OrderReceipt>("/orders", input);
  return res.data;
}

// Creates the order (payment "Pending") and a Stripe test-mode Checkout
// Session for it, returning the hosted-checkout URL to redirect to.
export async function startStripeCheckout(input: CreateOrderInput): Promise<{ url: string }> {
  const res = await apiClient.post<{ url: string }>("/checkout/stripe-session", input);
  return res.data;
}
