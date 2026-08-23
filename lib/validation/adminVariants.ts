import { z } from "zod";

export const adminVariantUpdateSchema = z.object({
  sku: z.string().trim().max(100).nullable().optional(),
  conditionType: z.string().trim().max(50).nullable().optional(),
  cutType: z.string().trim().max(100).nullable().optional(),
  boneType: z.string().trim().max(100).nullable().optional(),
  skinType: z.string().trim().max(100).nullable().optional(),
  unit: z.string().trim().max(20).nullable().optional(),
  basePrice: z.coerce.number().min(0).nullable().optional(),
  discountPrice: z.coerce.number().min(0).nullable().optional(),
  stockCount: z.coerce.number().int().min(0).nullable().optional(),
});

// z.coerce fields accept string | number before parsing (form inputs are
// strings) but always parse to number — the form is typed against the
// input shape, the API payload against the parsed output shape.
export type AdminVariantUpdateForm = z.input<typeof adminVariantUpdateSchema>;
export type AdminVariantUpdateInput = z.output<typeof adminVariantUpdateSchema>;
