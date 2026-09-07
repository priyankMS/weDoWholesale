import { apiClient } from "@/lib/api/client";

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AdminLoginResponse = { name: string; email: string };
export type OkResponse = { ok: boolean };

export type AdminForgotPasswordPayload = { email: string };

export type AdminResetPasswordPayload = {
  token: string;
  password: string;
  confirmPassword: string;
};

export async function adminLogin(payload: AdminLoginPayload): Promise<AdminLoginResponse> {
  const res = await apiClient.post<AdminLoginResponse>("/admin/auth/login", payload);
  return res.data;
}

export async function adminLogout(): Promise<OkResponse> {
  const res = await apiClient.post<OkResponse>("/admin/auth/logout");
  return res.data;
}

export async function adminForgotPassword(
  payload: AdminForgotPasswordPayload,
): Promise<OkResponse> {
  const res = await apiClient.post<OkResponse>("/admin/auth/forgot-password", payload);
  return res.data;
}

export async function adminResetPassword(
  payload: AdminResetPasswordPayload,
): Promise<OkResponse> {
  const res = await apiClient.post<OkResponse>("/admin/auth/reset-password", payload);
  return res.data;
}
