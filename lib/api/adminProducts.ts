import { apiClient } from "@/lib/api/client";
import type { AdminProductCreateInput, AdminProductUpdateInput } from "@/lib/validation/adminProducts";

export async function updateAdminProduct(id: number, payload: AdminProductUpdateInput) {
  const res = await apiClient.patch(`/admin/products/${id}`, payload);
  return res.data;
}

export async function createAdminProduct(payload: AdminProductCreateInput) {
  const res = await apiClient.post<{ productId: number }>("/admin/products", payload);
  return res.data;
}
