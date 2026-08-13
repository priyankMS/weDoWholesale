import { z } from "zod";

export const businessInfoSchema = z.object({
  businessType: z.enum(["restaurant", "grocery", "mosque", "catering"]),
  businessName: z.string().min(2, "Enter your business name"),
  city: z.string().min(1, "Select a city"),
  address: z.string().min(5, "Enter your business address"),
  monthlyVolume: z.enum([
    "under_50kg",
    "50_100kg",
    "100_200kg",
    "200_500kg",
    "500kg_plus",
  ]),
});

const contactInfoFields = {
  contactName: z.string().min(2, "Enter your full name"),
  role: z.string().min(1, "Select your role"),
  email: z.email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
