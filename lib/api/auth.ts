import { apiClient } from "@/lib/api/client";
import type {
  AccountStatus,
  BusinessType,
  MonthlyVolume,
} from "@/lib/db/models/User";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  businessType: BusinessType;
  businessName: string;
  city: string;
  address: string;
  monthlyVolume: MonthlyVolume;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
};

export type ForgotPasswordPayload = { email: string };

export type ResetPasswordPayload = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type AuthStatusResponse = { status: AccountStatus };
export type OkResponse = { ok: boolean };

export async function login(payload: LoginPayload): Promise<AuthStatusResponse> {
  const res = await apiClient.post<AuthStatusResponse>("/auth/login", payload);
  return res.data;
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthStatusResponse> {
  const res = await apiClient.post<AuthStatusResponse>("/auth/register", payload);
  return res.data;
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<OkResponse> {
  const res = await apiClient.post<OkResponse>("/auth/forgot-password", payload);
  return res.data;
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<OkResponse> {
  const res = await apiClient.post<OkResponse>("/auth/reset-password", payload);
  return res.data;
}

export async function logout(): Promise<OkResponse> {
  const res = await apiClient.post<OkResponse>("/auth/logout");
  return res.data;
}
