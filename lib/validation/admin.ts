import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase().max(255),
  password: z.string().min(1, "Enter your password").max(128),
});

// Matches the client-side strength meter's own bar (length + a number or
// symbol), same rule as lib/validation/auth.ts's passwordSchema.
const adminPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Za-z]/, "Password must include at least one letter")
  .regex(/[0-9]/, "Password must include at least one number");

export const adminForgotPasswordSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase().max(255),
});

export const adminResetPasswordSchema = z
  .object({
    token: z.string().trim().min(1).max(255),
    password: adminPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
