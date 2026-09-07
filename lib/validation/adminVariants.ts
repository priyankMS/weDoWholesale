import { z } from "zod";

export const adminVariantUpdateSchema = z.object({
  sku: z.string().trim().max(100).nullable().optional(),
  conditionType: z.string().trim().max(50).nullable().optional(),
  cutType: z.string().trim().max(100).nullable().optional(),
  boneType: z.string().trim().max(100).nullable().optional(),
  skinType: z.string().trim().max(100).nullable().optional(),
  fatLevel: z.string().trim().max(50).nullable().optional(),
  region: z.string().trim().max(255).nullable().optional(),
  cutValue: z.string().trim().max(100).nullable().optional(),
  minOrderQty: z.coerce.number().min(0).nullable().optional(),
  minOrderUnit: z.string().trim().max(10).nullable().optional(),
  legacySku: z.string().trim().max(50).nullable().optional(),
  unit: z.string().trim().max(20).nullable().optional(),
  basePrice: z.coerce.number().min(0).nullable().optional(),
  discountPrice: z.coerce.number().min(0).nullable().optional(),
  stockStatus: z.enum(["in", "low", "out"]).nullable().optional(),
});

// z.coerce fields accept string | number before parsing (form inputs are
// strings) but always parse to number — the form is typed against the
// input shape, the API payload against the parsed output shape.
export type AdminVariantUpdateForm = z.input<typeof adminVariantUpdateSchema>;
export type AdminVariantUpdateInput = z.output<typeof adminVariantUpdateSchema>;
