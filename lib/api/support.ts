import { apiClient } from "@/lib/api/client";

export type SupportOrderLookupResult = {
  orderNumber: string;
  statusLabel: string;
  createdAt: string;
  totalKg: number;
  finalAmount: string;
};

export async function lookupSupportOrder(orderNumber: string): Promise<SupportOrderLookupResult> {
  const res = await apiClient.get<{ result: SupportOrderLookupResult }>(
    `/support/order-lookup/${encodeURIComponent(orderNumber)}`,
  );
  return res.data.result;
}
