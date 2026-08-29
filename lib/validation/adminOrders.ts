import { z } from "zod";

export const adminOrderStatusSchema = z.object({
  orderStatus: z.enum(["pending", "new", "shipped", "delivered", "cancelled", "returned"]),
});

export const adminWeightAdjustmentSchema = z.object({
  orderItemId: z.coerce.number().int().positive(),
  actualQuantity: z.coerce.number().min(0),
  note: z.string().trim().max(500).nullable().optional(),
  manualAmount: z.coerce.number().nullable().optional(),
});
