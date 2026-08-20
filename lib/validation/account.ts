import { z } from "zod";

// Reused across register (lib/validation/auth.ts) and here — kept as a
// separate copy rather than importing from auth.ts, since the profile form
// intentionally has looser rules in a couple of places (e.g. it doesn't
// touch password/email, which have their own dedicated "Change"/"Reset"
// actions on the mockup's Business profile screen).
const nameSchema = (label: string, max = 255) =>
  z.string().trim().min(2, `Enter ${label}`).max(max, `${label} is too long`);

export const updateProfileSchema = z.object({
  businessType: z.enum(["restaurant", "grocery", "mosque", "catering"]),
  businessName: nameSchema("your business name"),
  city: z.string().trim().min(1, "Select a city").max(120),
  businessAddress: z
    .string()
    .trim()
    .min(5, "Enter your business address")
    .max(255, "Address is too long"),
  contactName: nameSchema("your full name"),
  role: z.string().trim().min(1, "Select your role").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(40, "Phone number is too long")
    .regex(/^[0-9+()\- .]+$/, "Enter a valid phone number"),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Enter a label").max(120),
  business: z.string().trim().min(1, "Enter a business name").max(255),
  street: z.string().trim().min(1, "Enter a street address").max(255),
  city: z.string().trim().min(1, "Select a city").max(120),
  postalCode: z.string().trim().min(1, "Enter a postal code").max(20),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(40, "Phone number is too long")
    .regex(/^[0-9+()\- .]+$/, "Enter a valid phone number"),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const notificationPreferencesSchema = z.object({
  waOrderConfirmed: z.boolean(),
  waOrderDispatched: z.boolean(),
  waSubstitutionAlerts: z.boolean(),
  waLowStock: z.boolean(),
  emailOrderConfirmation: z.boolean(),
  emailInvoice: z.boolean(),
  emailMonthlyStatement: z.boolean(),
  emailPaymentDueReminders: z.boolean(),
  promoNewProducts: z.boolean(),
  promoEidSeasonal: z.boolean(),
  promoPriceChanges: z.boolean(),
});
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
