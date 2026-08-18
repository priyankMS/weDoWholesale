import { UniqueConstraintError } from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { Order } from "@/lib/db/models/Order";
import { OrderItem } from "@/lib/db/models/OrderItem";
import { Address } from "@/lib/db/models/Address";
import { WdhVariant } from "@/lib/db/models/WdhVariant";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
import { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
import { User } from "@/lib/db/models/User";
import { bestVariantPrice } from "@/lib/db/queries/catalogue";
import { variantLabel } from "@/lib/format";
import type { CreateOrderInput } from "@/lib/validation/orders";

const GST_RATE = 0.05;
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
  const user = await User.findByPk(userId);
  if (!user) throw new OrderError("Account not found");
  // Phase 1's pending-review screen tells buyers "ordering is unlocked
  // once your account is approved" — enforced here, not just implied by
  // that copy, since this is the only place an order actually gets
  // created.
  if (user.status !== "approved") {
    throw new OrderError(
      "Your account is still under review. You'll be able to place orders once it's approved.",
    );
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
      unitPrice: price,
      totalPrice,
    });
  }
  subtotal = round2(subtotal);

  const gstAmount = round2(subtotal * GST_RATE);
  const codCharges =
    input.paymentOption === "cod" ? round2((subtotal + gstAmount) * COD_SURCHARGE_RATE) : 0;
  const finalAmount = round2(subtotal + gstAmount + codCharges);
  const paymentMethod =
    input.paymentOption === "e_transfer" || input.paymentOption === "net_terms" ? "Online" : "COD";

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
        unitPrice: li.unitPrice,
        totalPrice: li.totalPrice,
      })),
      { transaction: t },
    );

    return { orderNumber: order.orderNumber, subtotal, gstAmount, codCharges, finalAmount };
  });
}
