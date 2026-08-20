import { z } from "zod";

export const adminCustomerStatusUpdateSchema = z.object({
  status: z.enum(["approved", "rejected", "pending_review"]),
});

export type AdminCustomerStatusUpdateInput = z.infer<typeof adminCustomerStatusUpdateSchema>;
