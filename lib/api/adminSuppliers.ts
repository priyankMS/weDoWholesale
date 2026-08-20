import { apiClient } from "@/lib/api/client";
import type { AdminSupplierInput } from "@/lib/validation/adminSuppliers";

export async function createAdminSupplier(payload: AdminSupplierInput) {
  const res = await apiClient.post("/admin/suppliers", payload);
  return res.data;
}

export async function updateAdminSupplier(id: number, payload: Partial<AdminSupplierInput>) {
  const res = await apiClient.patch(`/admin/suppliers/${id}`, payload);
  return res.data;
}
