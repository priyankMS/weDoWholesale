import { z } from "zod";

export const adminOrderStatusSchema = z.object({
  orderStatus: z.enum(["pending", "new", "shipped", "delivered", "cancelled", "returned"]),
});
