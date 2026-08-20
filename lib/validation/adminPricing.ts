import { z } from "zod";

export const adminPricingUpdateSchema = z.object({
  dealerPrice: z.coerce.number().min(0).nullable().optional(),
  priceIncrement: z.coerce.number().nullable().optional(),
  retailPrice: z.coerce.number().min(0).nullable().optional(),
});

export type AdminPricingUpdateInput = z.infer<typeof adminPricingUpdateSchema>;

export const adminPricingCreateSchema = z.object({
  variantId: z.coerce.number().int().positive(),
  supplierId: z.coerce.number().int().positive().nullable().optional(),
  label: z.string().trim().max(50).nullable().optional(),
  dealerPrice: z.coerce.number().min(0).nullable().optional(),
  priceIncrement: z.coerce.number().nullable().optional(),
  retailPrice: z.coerce.number().min(0).nullable().optional(),
});

export type AdminPricingCreateForm = z.input<typeof adminPricingCreateSchema>;
export type AdminPricingCreateInput = z.output<typeof adminPricingCreateSchema>;
