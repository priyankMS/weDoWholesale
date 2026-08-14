import { z } from "zod";

export const toggleSavedSchema = z.object({
  productId: z.number().int().positive(),
});
