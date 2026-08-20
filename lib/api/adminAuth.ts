import { apiClient } from "@/lib/api/client";

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AdminLoginResponse = { name: string; email: string };
export type OkResponse = { ok: boolean };

export async function adminLogin(payload: AdminLoginPayload): Promise<AdminLoginResponse> {
  const res = await apiClient.post<AdminLoginResponse>("/admin/auth/login", payload);
  return res.data;
}

export async function adminLogout(): Promise<OkResponse> {
  const res = await apiClient.post<OkResponse>("/admin/auth/logout");
  return res.data;
}
