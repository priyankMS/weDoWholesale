import { UniqueConstraintError } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Order } from "@/lib/db/models/Order";
import { OrderItem } from "@/lib/db/models/OrderItem";
import { Address } from "@/lib/db/models/Address";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { User } from "@/lib/db/models/User";
import { bestVariantPrice, unitFor } from "@/lib/db/queries/catalogue";
import { getPlatformSettings } from "@/lib/db/queries/settings";
import { getNotificationPreferences } from "@/lib/db/queries/account";
import { formatDate, formatMoney, variantLabel } from "@/lib/format";
import { enqueueEmail } from "@/lib/queue/emailQueue";
import { orderConfirmationEmail } from "@/lib/email/templates/orderConfirmation";
import type { CreateOrderInput } from "@/lib/validation/orders";

const COD_SURCHARGE_RATE = 0.02;

const WINDOW_LABEL: Record<string, string> = {
  morning: "Morning (8 AM – 12 PM)",
  afternoon: "Afternoon (12 PM – 5 PM)",
};

export class OrderError extends Error {}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function generateOrderNumber(): string {
  return `WDH-${Math.floor(1000 + Math.random() * 9000)}`;
}

export type OrderReceipt = {
  orderNumber: string;
  subtotal: number;
  gstAmount: number;
  codCharges: number;
  finalAmount: number;
};

// Re-prices and re-validates every cart line against the database before
// creating anything — the client's cart is just a local convenience
// (localStorage), never a trusted source for prices or product/variant
// identity.
export async function createOrder(
  userId: number,
  input: CreateOrderInput,
): Promise<OrderReceipt> {
  const [user, settings] = await Promise.all([User.findByPk(userId), getPlatformSettings()]);
  if (!user) throw new OrderError("Account not found");
  if (user.status !== "approved") {
    throw new OrderError("Your account is still under review — ordering unlocks once approved.");
  }

  const variants = await WdhVariant.findAll({
    where: { id: input.items.map((i) => i.variantId) },
    include: [{ model: WdhProduct }, { model: WdhVariantPricing, as: "pricing" }],
  });
  const variantById = new Map(variants.map((v) => [v.id, v]));

  let subtotal = 0;
  const lineItems: {
    variantId: number;
    productId: number;
    sku: string | null;
    productName: string;
    qty: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }[] = [];

  for (const item of input.items) {
    const variant = variantById.get(item.variantId) as
      | (WdhVariant & { WdhProduct?: WdhProduct })
      | undefined;
    if (!variant || variant.productId !== item.productId) {
      throw new OrderError("One of the items in your cart is no longer available.");
    }
    const price = bestVariantPrice(variant, variant.pricing ?? []);
    const product = variant.WdhProduct;
    if (price == null) {
      throw new OrderError(
        `${product?.item ?? "An item"} in your cart no longer has a price and can't be ordered — remove it and try again.`,
      );
    }
    const label = variantLabel(variant);
    const productName = product
      ? label && label !== "Standard"
        ? `${product.item} (${label})`
        : product.item
      : `Item #${variant.id}`;
    const totalPrice = round2(price * item.qty);
    subtotal += totalPrice;
    lineItems.push({
      variantId: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      productName,
      qty: item.qty,
      unit: unitFor(product?.category ?? "", variant.per ?? null),
      unitPrice: price,
      totalPrice,
    });
  }
  subtotal = round2(subtotal);

  const gstAmount = round2(subtotal * (settings.gstRatePercent / 100));
  const codCharges =
    input.paymentOption === "cod" ? round2((subtotal + gstAmount) * COD_SURCHARGE_RATE) : 0;
  const finalAmount = round2(subtotal + gstAmount + codCharges);
  const paymentMethod =
    input.paymentOption === "cod" ? "COD" : "Online";

  return sequelize.transaction(async (t) => {
    let shippingAddressId: number | null = null;
    if (input.delivery.method === "delivery") {
      const address = await Address.create(
        {
          name: input.delivery.business,
          mobile: input.delivery.phone,
          email: user.email,
          userId,
          address: input.delivery.street,
          zipCode: input.delivery.postalCode,
          city: input.delivery.city,
          country: "Canada",
        },
        { transaction: t },
      );
      shippingAddressId = address.id;
    }

    let order: Order | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        order = await Order.create(
          {
            userId,
            orderNumber: generateOrderNumber(),
            totalAmount: subtotal,
            discountAmount: 0,
            shippingFee: 0,
            shippingType: input.delivery.method,
            codCharges,
            finalAmount,
            paymentMethod,
            paymentStatus: "Pending",
            orderStatus: "new",
            shippingAddressId,
            billingAddressId: shippingAddressId,
            timeSlot: WINDOW_LABEL[input.delivery.window],
            deliveryDate: input.delivery.date,
            gstAmount,
            paymentOption: input.paymentOption,
            notes: input.delivery.notes || null,
            paidAmount: null,
            isReorder: false,
            sourceOrderNumber: null,
          },
          { transaction: t },
        );
        break;
      } catch (err) {
        if (err instanceof UniqueConstraintError && attempt < 4) continue;
        throw err;
      }
    }
    if (!order) throw new OrderError("Could not create order — please try again.");

    await OrderItem.bulkCreate(
      lineItems.map((li) => ({
        orderId: order!.id,
        productId: li.productId,
        variantId: li.variantId,
        sku: li.sku,
        productName: li.productName,
        quantity: li.qty,
        unit: li.unit,
        unitPrice: li.unitPrice,
        totalPrice: li.totalPrice,
      })),
      { transaction: t },
    );

    return { orderNumber: order.orderNumber, subtotal, gstAmount, codCharges, finalAmount };
  });
}

// Sends Email 36 (order confirmation) — called right after an order is
// actually confirmed: immediately for COD/e-transfer/net-terms orders (the
// order itself IS the confirmation), or from the Stripe webhook once
// payment succeeds for card orders (never from stripe-session/route.ts,
// which only creates the order — it isn't paid yet). Respects the
// customer's own emailOrderConfirmation notification preference.
export async function notifyOrderConfirmed(orderNumber: string): Promise<void> {
  const order = await Order.findOne({
    where: { orderNumber },
    include: [{ model: User }, { model: OrderItem }],
  });
  const user = (order as (Order & { User?: User }) | null)?.User;
  if (!order || !user?.email) return;

  const prefs = await getNotificationPreferences(user.id);
  if (!prefs.emailOrderConfirmation) return;

  const items = (order.get("OrderItems") as OrderItem[] | undefined) ?? [];
  const address = order.shippingAddressId ? await Address.findByPk(order.shippingAddressId) : null;
  const deliveryAddress =
    order.shippingType === "pickup"
      ? "Pickup at our warehouse"
      : (address
          ? [address.address, address.city, address.zipCode, address.country].filter(Boolean).join(", ")
          : "—");

  const cutoffDate = order.deliveryDate ? new Date(order.deliveryDate) : null;
  if (cutoffDate) cutoffDate.setDate(cutoffDate.getDate() - 1);

  const { subject, html, text } = orderConfirmationEmail({
    contactName: user.contactName || user.businessName || "there",
    businessName: user.businessName || user.contactName || "your business",
    orderNumber: order.orderNumber,
    deliveryDateLabel: order.deliveryDate ? formatDate(order.deliveryDate) : "To be confirmed",
    windowLabel: order.timeSlot || "To be confirmed",
    deliveryAddress,
    paymentLabel: order.paymentMethod === "COD" ? "Cash on delivery" : "Online payment",
    items: items.map((i) => ({
      name: i.productName ?? `Item #${i.productId}`,
      meta: `${Number(i.quantity)} ${i.unit || "kg"}${i.sku ? ` · ${i.sku}` : ""}`,
      totalPrice: Number(i.totalPrice),
    })),
    subtotal: Number(order.totalAmount),
    gstAmount: Number(order.gstAmount ?? 0),
    deliveryFeeLabel: Number(order.shippingFee ?? 0) > 0 ? formatMoney(Number(order.shippingFee)) : "Free",
    total: Number(order.finalAmount),
    cancellationCutoffLabel: cutoffDate ? `${formatDate(cutoffDate)}, 6:00 PM` : "24 hours before delivery",
  });
  await enqueueEmail({ to: user.email, subject, html, text });
}

export type OrderSummary = {
  orderNumber: string;
  finalAmount: number;
  paymentStatus: string;
  deliveryDate: string | null;
  timeSlot: string | null;
  paymentOption: string | null;
};

export async function getOrderByNumber(
  userId: number,
  orderNumber: string,
): Promise<OrderSummary | null> {
  const order = await Order.findOne({ where: { userId, orderNumber } });
  if (!order) return null;
  return {
    orderNumber: order.orderNumber,
    finalAmount: Number(order.finalAmount),
    paymentStatus: order.paymentStatus,
    deliveryDate: order.deliveryDate,
    timeSlot: order.timeSlot,
    paymentOption: order.paymentOption,
  };
}

export type StripePaymentDetails = {
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  receiptUrl: string | null;
  paidAt: Date;
  cardBrand: string | null;
  cardLast4: string | null;
};

// Idempotent — safe for the webhook to redeliver the same event (Stripe's
// at-least-once delivery) since it only ever moves Pending → Completed.
// Returns whether this call was the one that actually made that
// transition, so the caller can send the one-time order-confirmation email
// only once instead of on every redelivered event.
export async function markOrderPaidFromStripe(
  orderNumber: string,
  details: StripePaymentDetails,
): Promise<boolean> {
  const [affected] = await Order.update(
    {
      paymentStatus: "Completed",
      stripeSessionId: details.stripeSessionId,
      stripePaymentIntentId: details.stripePaymentIntentId,
      receiptUrl: details.receiptUrl,
      paidAt: details.paidAt,
      cardBrand: details.cardBrand,
      cardLast4: details.cardLast4,
    },
    { where: { orderNumber, paymentStatus: "Pending" } },
  );
  return affected > 0;
}

// Covers both a delayed payment method failing (checkout.session.async_payment_failed)
// and an abandoned Checkout Session (checkout.session.expired) — either way the
// order never got paid, so it's flipped to Failed/cancelled rather than left
// stuck Pending/new forever (which would otherwise linger as a live order in
// the customer's active-orders list and the admin dashboard). Guarded the
// same way as markOrderPaidFromStripe: only ever moves out of Pending once.
export async function markOrderPaymentFailed(orderNumber: string): Promise<void> {
  await Order.update(
    { paymentStatus: "Failed", orderStatus: "cancelled" },
    { where: { orderNumber, paymentStatus: "Pending" } },
  );
}
