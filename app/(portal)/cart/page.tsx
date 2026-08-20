"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCart, type CartItem } from "@/lib/cart/CartContext";
import { useToast } from "@/components/portal/ToastProvider";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { categoryGradient, productIcon } from "@/lib/productVisuals";

const MIN_ORDER_QTY = 100;
const GST_RATE = 0.05;

function groupBySupplier(items: CartItem[]): { supplierName: string | null; items: CartItem[] }[] {
  const order: (string | null)[] = [];
  const map = new Map<string | null, CartItem[]>();
  for (const item of items) {
    const key = item.supplierName;
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(item);
  }
  return order.map((supplierName) => ({ supplierName, items: map.get(supplierName)! }));
}

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, totalQty } = useCart();
  const showToast = useToast();
  const groups = useMemo(() => groupBySupplier(items), [items]);

  function handleRemove(item: CartItem) {
    removeItem(item.variantId);
    showToast(`${item.name} removed from cart`);
  }

  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;
  const underMinimum = totalQty < MIN_ORDER_QTY;

  if (items.length === 0) {
    return (
      <div className="px-8 py-14 text-center">
        <div className="mb-3 text-[3.5rem]">🛒</div>
        <div className="mb-2 font-serif text-[1.2rem] font-bold text-neutral-900">
          Your cart is empty
        </div>
        <div className="mb-5 text-[0.84rem] leading-relaxed text-neutral-500">
          Browse the catalogue and add products to get started.
        </div>
        <Link
          href="/catalogue"
          className="inline-block rounded-full bg-primary-500 px-5 py-2.5 text-[0.86rem] font-bold text-white hover:bg-primary-600"
        >
          Browse catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-4 lg:flex lg:items-start lg:gap-8">
      <div className="min-w-0 lg:flex-1">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 lg:px-0 lg:pt-6">
          <div>
            <div className="font-serif text-[1.25rem] font-black text-neutral-900">
              Your order
            </div>
            <div className="text-[0.76rem] text-neutral-400">
              {items.length} item{items.length !== 1 ? "s" : ""} · est. {totalQty} kg
            </div>
          </div>
          <Link href="/catalogue" className="text-[0.82rem] font-bold text-primary-500">
            ← Continue shopping
          </Link>
        </div>

        {underMinimum && (
          <div className="mx-4 mb-3.5 flex items-start gap-2.5 rounded-2xl border-[1.5px] border-amber-300 bg-amber-50 px-4 py-3 text-[0.8rem] text-amber-800 lg:mx-0">
            <span>⚠️</span>
            <span>
              Minimum order is {MIN_ORDER_QTY} kg total — add {MIN_ORDER_QTY - totalQty} more to
              proceed to checkout.
            </span>
          </div>
        )}

        <div className="mx-4 flex flex-col gap-3.5 lg:mx-0">
          {groups.map((group) => (
            <div
              key={group.supplierName ?? "__other__"}
              className="overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white"
            >
              <div className="flex items-center gap-2 bg-neutral-900 px-4 py-2.5 text-white">
                <span className="text-[0.95rem]">🏭</span>
                <span className="text-[0.8rem] font-bold">
                  {group.supplierName ?? "Other items"}
                </span>
              </div>
              <div className="divide-y divide-neutral-100">
                {group.items.map((item) => (
                  <div key={item.variantId} className="relative flex items-start gap-3 p-3.5">
                    <Link
                      href={`/products/${item.productId}`}
                      className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px]"
                      style={
                        item.image ? undefined : { backgroundImage: categoryGradient(item.category) }
                      }
                    >
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[1.6rem]">{productIcon(item.category)}</span>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1 pr-6">
                      <Link
                        href={`/products/${item.productId}`}
                        className="block truncate text-[0.9rem] font-bold text-neutral-900 hover:text-primary-600"
                      >
                        {item.name}
                      </Link>
                      {item.unit === "kg" && (
                        <div className="mt-0.25 text-[0.68rem] text-neutral-400">
                          ⚖️ est. weight — adjusted on delivery
                        </div>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-end justify-between gap-2">
                        <div className="font-serif text-[0.95rem] font-bold text-primary-600">
                          ${(item.price * item.qty).toFixed(2)}
                          <span className="ml-1 text-[0.7rem] font-medium text-neutral-400">
                            (${item.price.toFixed(2)} / {item.unit})
                          </span>
                        </div>
                        <QtyStepper value={item.qty} onChange={(q) => updateQty(item.variantId, q)} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-[0.85rem] text-neutral-300 hover:bg-red-50 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-3.5 lg:mx-0 lg:mt-6 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border-[1.5px] border-neutral-200 bg-white p-4 lg:sticky lg:top-24">
          <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Order summary
          </div>
          <div className="flex items-center justify-between py-1 text-[0.86rem]">
            <span className="text-neutral-500">Subtotal (est. {totalQty} kg)</span>
            <span className="font-semibold text-neutral-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-1 text-[0.86rem]">
            <span className="text-neutral-500">GST (5%)</span>
            <span className="font-semibold text-neutral-900">${gst.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-1 text-[0.86rem]">
            <span className="text-neutral-500">Delivery</span>
            <span className="font-semibold text-green-600">Free</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between border-t border-neutral-200 pt-2.5 text-[1rem]">
            <span className="font-bold text-neutral-900">Order total (est.)</span>
            <span className="font-serif font-black text-primary-600">${total.toFixed(2)}</span>
          </div>

          <div className="mt-3.5 text-[0.72rem] leading-relaxed text-neutral-400">
            ⚖️ This total is an estimate. Fresh meat items are invoiced at actual delivered
            weight, which may differ slightly from your order.
          </div>

          <div className="mt-3.5">
            {underMinimum ? (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-neutral-200 py-3.5 text-center text-[0.9rem] font-extrabold text-neutral-400"
              >
                Add {MIN_ORDER_QTY - totalQty} more kg to checkout
              </button>
            ) : (
              <Link
                href="/checkout"
                className="block w-full rounded-xl bg-primary-500 py-3.5 text-center text-[0.9rem] font-extrabold text-white hover:bg-primary-600"
              >
                Proceed to checkout →
              </Link>
            )}
          </div>

          <div className="mt-3 flex items-start gap-2 text-[0.7rem] leading-relaxed text-neutral-400">
            <span>📋</span>
            <span>All wholesale orders are binding once placed. Review carefully before checkout.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
