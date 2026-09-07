import { z } from "zod";

export const adminOrderStatusSchema = z.object({
  orderStatus: z.enum(["pending", "new", "shipped", "delivered", "cancelled", "returned"]),
});

export const adminAddOrderItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  variantId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().positive(),
  note: z.string().trim().max(500).nullable().optional(),
});

export const adminUpdateOrderItemSchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  variantId: z.coerce.number().int().positive().optional(),
  quantity: z.coerce.number().min(0),
  // Manual price override — e.g. the actual weighed amount justifies a
  // different per-unit price than the catalog's.
  unitPrice: z.coerce.number().min(0).optional(),
  note: z.string().trim().max(500).nullable().optional(),
});
