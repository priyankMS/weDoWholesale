"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart/CartContext";

// The Stripe redirect flow can't clear the cart itself (that happens on
// the client, and this page is what the browser lands on after leaving
// and coming back from Stripe's hosted checkout) — this fires once on
// mount instead of the inline clear() call CheckoutClient uses for the
// non-card payment methods.
export function ClearCartOnMount() {
  const { clear } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
