import { apiClient } from "@/lib/api/client";
import type { AdminCustomerStatusUpdateInput } from "@/lib/validation/adminCustomers";

export async function updateAdminCustomerStatus(id: number, payload: AdminCustomerStatusUpdateInput) {
  const res = await apiClient.patch(`/admin/customers/${id}`, payload);
  return res.data;
}
