import { z } from "zod";

export const adminProductUpdateSchema = z.object({
  item: z.string().trim().min(1, "Product name is required").max(255),
  category: z.string().trim().max(100).nullable().optional(),
  type: z.string().trim().max(100).nullable().optional(),
  sku: z.string().trim().max(100).nullable().optional(),
  shortDesc: z.string().trim().max(2000).nullable().optional(),
  longDesc1: z.string().trim().max(5000).nullable().optional(),
  metaTitle: z.string().trim().max(255).nullable().optional(),
  metaDesc: z.string().trim().max(500).nullable().optional(),
  thumbnailAlt: z.string().trim().max(255).nullable().optional(),
});

export type AdminProductUpdateInput = z.infer<typeof adminProductUpdateSchema>;

// Product creation also seeds one initial variant (so the product can
// actually show a price/stock state in the catalogue right away) and,
// optionally, that variant's first pricing row — rather than leaving the
// admin to hop between three separate screens for a brand-new product.
export const adminProductCreateSchema = z.object({
  item: z.string().trim().min(1, "Product name is required").max(255),
  category: z.string().trim().min(1, "Category is required").max(100),
  type: z.string().trim().max(100).nullable().optional(),
  sku: z.string().trim().max(100).nullable().optional(),
  shortDesc: z.string().trim().max(2000).nullable().optional(),
  longDesc1: z.string().trim().max(5000).nullable().optional(),
  metaTitle: z.string().trim().max(255).nullable().optional(),
  metaDesc: z.string().trim().max(500).nullable().optional(),
  thumbnailAlt: z.string().trim().max(255).nullable().optional(),

  variantLabel: z.string().trim().max(255).nullable().optional(),
  unit: z.string().trim().min(1, "Unit is required").max(100),
  stockCount: z.coerce.number().int().min(0).nullable().optional(),

  supplierId: z.coerce.number().int().positive().nullable().optional(),
  dealerPrice: z.coerce.number().min(0).nullable().optional(),
  priceIncrement: z.coerce.number().nullable().optional(),
  retailPrice: z.coerce.number().min(0).nullable().optional(),
});

// z.coerce fields accept string | number before parsing (form inputs are
// strings) but always parse to number — the form is typed against the
// input shape, the API payload against the parsed output shape.
export type AdminProductCreateForm = z.input<typeof adminProductCreateSchema>;
export type AdminProductCreateInput = z.output<typeof adminProductCreateSchema>;
