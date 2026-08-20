import { apiClient } from "@/lib/api/client";
import type { AdminSettingsInput } from "@/lib/validation/adminSettings";

export async function updateAdminSettings(payload: AdminSettingsInput) {
  const res = await apiClient.patch("/admin/settings", payload);
  return res.data;
}
