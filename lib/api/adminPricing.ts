import { apiClient } from "@/lib/api/client";
import type { AdminPricingCreateInput, AdminPricingUpdateInput } from "@/lib/validation/adminPricing";

export async function updateAdminPricing(id: number, payload: AdminPricingUpdateInput) {
  const res = await apiClient.patch(`/admin/pricing/${id}`, payload);
  return res.data;
}

export async function createAdminPricing(payload: AdminPricingCreateInput) {
  const res = await apiClient.post("/admin/pricing", payload);
  return res.data;
}
