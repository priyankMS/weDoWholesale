import { apiClient } from "@/lib/api/client";
import type { OrderStatus } from "@/lib/db/models/Order";

export async function updateAdminOrderStatus(id: number, orderStatus: OrderStatus) {
  const res = await apiClient.patch(`/admin/orders/${id}`, { orderStatus });
  return res.data;
}

export async function recordWeightAdjustment(
  orderId: number,
  input: {
    orderItemId: number;
    actualQuantity: number;
    note?: string | null;
    manualAmount?: number | null;
  },
) {
  const res = await apiClient.post<{ adjustmentAmount: number }>(
    `/admin/orders/${orderId}/weight-adjustment`,
    input,
  );
  return res.data;
}
