import { apiClient } from "@/lib/api/client";
import type { OrderStatus } from "@/lib/db/models/Order";

export async function updateAdminOrderStatus(id: number, orderStatus: OrderStatus) {
  const res = await apiClient.patch(`/admin/orders/${id}`, { orderStatus });
  return res.data;
}
