"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import useSWR, { type KeyedMutator } from "swr";

export type CartItem = {
  productId: number;
  variantId: number;
  name: string;
  category: string;
  unit: string;
  image: string | null;
  price: number;
  qty: number;
  supplierName: string | null;
};

type CartContextValue = {
  items: CartItem[];
  // False until the localStorage read has resolved at least once. A fresh
  // full page load (as opposed to client-side navigation from an
  // already-mounted cart) briefly has `items === []` before that read
  // completes — callers that redirect on an empty cart (e.g. checkout
  // bouncing back to /cart) must wait for `ready` first, or they'll bounce
  // a real, non-empty cart on every hard refresh/direct link.
  ready: boolean;
  addItem: (item: Omit<CartItem, "qty">, qty: number) => void;
  removeItem: (variantId: number) => void;
  updateQty: (variantId: number, qty: number) => void;
  clear: () => void;
  subtotal: number;
  totalQty: number;
  lineCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "wdh_cart_v1";
const CART_SWR_KEY = "wdh-cart";

// Same pattern as useSavedProducts (lib/hooks/useSavedProducts.ts) — SWR
// owns the async read of the persisted value (here, localStorage instead
// of an API call) so every write goes through mutate() rather than a raw
// useState+useEffect pair, which avoids a hydration-mismatch render and
// the "setState in an effect" anti-pattern for what's fundamentally a
// read of external state on mount.
async function loadCart(): Promise<CartItem[]> {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full/blocked — cart still works for the session, just won't survive a reload.
  }
}

function writeCart(mutate: KeyedMutator<CartItem[]>, next: (prev: CartItem[]) => CartItem[]) {
  mutate(
    (prev) => {
      const items = next(prev ?? []);
      persist(items);
      return items;
    },
    { revalidate: false },
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  // No fallbackData here on purpose — `data` staying undefined until the
  // real localStorage read resolves is what makes `ready` trustworthy.
  const { data, mutate } = useSWR(CART_SWR_KEY, loadCart);
  const items = useMemo(() => data ?? [], [data]);
  const ready = data !== undefined;

  const addItem = useCallback(
    (item: Omit<CartItem, "qty">, qty: number) => {
      writeCart(mutate, (prev) => {
        const existing = prev.find((i) => i.variantId === item.variantId);
        if (existing) {
          return prev.map((i) =>
            i.variantId === item.variantId ? { ...i, qty: i.qty + qty } : i,
          );
        }
        return [...prev, { ...item, qty }];
      });
    },
    [mutate],
  );

  const removeItem = useCallback(
    (variantId: number) => {
      writeCart(mutate, (prev) => prev.filter((i) => i.variantId !== variantId));
    },
    [mutate],
  );

  const updateQty = useCallback(
    (variantId: number, qty: number) => {
      writeCart(mutate, (prev) =>
        qty <= 0
          ? prev.filter((i) => i.variantId !== variantId)
          : prev.map((i) => (i.variantId === variantId ? { ...i, qty } : i)),
      );
    },
    [mutate],
  );

  const clear = useCallback(() => writeCart(mutate, () => []), [mutate]);

  const { subtotal, totalQty } = useMemo(
    () => ({
      subtotal: items.reduce((sum, i) => sum + i.price * i.qty, 0),
      totalQty: items.reduce((sum, i) => sum + i.qty, 0),
    }),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      ready,
      addItem,
      removeItem,
      updateQty,
      clear,
      subtotal,
      totalQty,
      lineCount: items.length,
    }),
    [items, ready, addItem, removeItem, updateQty, clear, subtotal, totalQty],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
