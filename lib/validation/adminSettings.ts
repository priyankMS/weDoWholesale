import { z } from "zod";

export const adminSettingsSchema = z.object({
  default_markup_percent: z.coerce.number().min(0).max(1000),
  free_delivery_threshold: z.coerce.number().min(0),
  wholesale_min_order_kg: z.coerce.number().min(0),
  gst_rate_percent: z.coerce.number().min(0).max(100),
});

export type AdminSettingsForm = z.input<typeof adminSettingsSchema>;
export type AdminSettingsInput = z.output<typeof adminSettingsSchema>;
