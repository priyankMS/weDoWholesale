import { z } from "zod";

export const adminSupplierSchema = z.object({
  name: z.string().trim().min(1, "Supplier name is required").max(255),
  contactName: z.string().trim().max(255).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  email: z.union([z.email().max(255), z.literal("")]).nullable().optional(),
  paymentTerms: z.string().trim().max(50).nullable().optional(),
  halalCertStatus: z.string().trim().max(30).nullable().optional(),
  isActive: z.boolean().optional(),
});

export type AdminSupplierInput = z.infer<typeof adminSupplierSchema>;
