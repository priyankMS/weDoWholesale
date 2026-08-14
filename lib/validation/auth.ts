import { z } from "zod";

// Matches the client-side strength meter's own bar (length + a number or
// symbol) so the server never accepts something the UI told the user was
// "weak".
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Za-z]/, "Password must include at least one letter")
  .regex(/[0-9]/, "Password must include at least one number");

const emailSchema = z
  .email("Enter a valid email")
  .trim()
  .toLowerCase()
  .max(255, "Email is too long");

const nameSchema = (label: string, max = 255) =>
  z.string().trim().min(2, `Enter ${label}`).max(max, `${label} is too long`);

export const businessInfoSchema = z.object({
  businessType: z.enum(["restaurant", "grocery", "mosque", "catering"]),
  businessName: nameSchema("your business name"),
  city: z.string().trim().min(1, "Select a city").max(120),
  address: z
    .string()
    .trim()
    .min(5, "Enter your business address")
    .max(255, "Address is too long"),
  monthlyVolume: z.enum([
    "under_50kg",
    "50_100kg",
    "100_200kg",
    "200_500kg",
    "500kg_plus",
  ]),
});

const contactInfoFields = {
  contactName: nameSchema("your full name"),
  role: z.string().trim().min(1, "Select your role").max(120),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(40, "Phone number is too long")
    .regex(/^[0-9+()\- .]+$/, "Enter a valid phone number"),
  password: passwordSchema,
  confirmPassword: z.string(),
  agreeTerms: z.literal(true, {
    error: "You must agree to the terms to continue",
  }),
};

export const contactInfoSchema = z
  .object(contactInfoFields)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerSchema = z
  .object({
    ...businessInfoSchema.shape,
    ...contactInfoFields,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(128),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1).max(255),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
