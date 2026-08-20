import { z } from "zod";

export const PAYMENT_OPTIONS = ["card", "cod", "e_transfer", "invoice", "net_terms"] as const;
export const DELIVERY_WINDOWS = ["morning", "afternoon"] as const;

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        variantId: z.number().int().positive(),
        qty: z.number().positive().max(100000),
      }),
    )
    .min(1, "Cart is empty"),
  delivery: z.object({
    method: z.enum(["delivery", "pickup"]),
    business: z.string().trim().min(1).max(255),
    street: z.string().trim().max(255).optional().default(""),
    city: z.string().trim().max(120).optional().default(""),
    postalCode: z.string().trim().max(20).optional().default(""),
    phone: z.string().trim().min(7).max(40),
    date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    window: z.enum(DELIVERY_WINDOWS),
    notes: z.string().trim().max(1000).optional().default(""),
  }),
  paymentOption: z.enum(PAYMENT_OPTIONS),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
