import { apiClient } from "@/lib/api/client";
import type { CreateOrderInput } from "@/lib/validation/orders";

export type OrderReceipt = {
  orderNumber: string;
  subtotal: number;
  gstAmount: number;
  codCharges: number;
  finalAmount: number;
};

export async function placeOrder(input: CreateOrderInput): Promise<OrderReceipt> {
  const res = await apiClient.post<OrderReceipt>("/orders", input);
  return res.data;
}
