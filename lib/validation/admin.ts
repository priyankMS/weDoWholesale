import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase().max(255),
  password: z.string().min(1, "Enter your password").max(128),
});
