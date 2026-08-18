"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

export function CartPill() {
  const { lineCount } = useCart();

  return (
    <Link
      href="/cart"
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary-500 px-3.5 py-2 text-[0.82rem] font-bold text-white transition-colors hover:bg-primary-600"
    >
      🛒 Cart
      <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[0.68rem] font-extrabold text-primary-600">
        {lineCount}
      </span>
    </Link>
  );
}
