import { apiClient } from "@/lib/api/client";
import type { AdminVariantUpdateInput } from "@/lib/validation/adminVariants";

export async function updateAdminVariant(id: number, payload: AdminVariantUpdateInput) {
  const res = await apiClient.patch(`/admin/variants/${id}`, payload);
  return res.data;
}
