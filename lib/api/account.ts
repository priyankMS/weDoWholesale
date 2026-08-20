import { apiClient } from "@/lib/api/client";
import type { AddressInput, NotificationPreferencesInput, UpdateProfileInput } from "@/lib/validation/account";

// Mirrors ReorderCartItem/ReorderResult in lib/db/queries/account.ts — kept
// as its own copy (rather than importing from that server-only module,
// which pulls in Sequelize) since this file is imported from client
// components.
export type ReorderCartItem = {
  productId: number;
  variantId: number;
  name: string;
  category: string;
  unit: string;
  image: string | null;
  price: number;
  supplierName: string | null;
  qty: number;
};
export type ReorderResult = {
  items: ReorderCartItem[];
  unavailable: string[];
};

export async function updateProfile(input: UpdateProfileInput): Promise<void> {
  await apiClient.patch("/account/profile", input);
}

export async function createAddress(input: AddressInput) {
  const res = await apiClient.post("/account/addresses", input);
  return res.data;
}

export async function updateAddress(id: number, input: AddressInput) {
  const res = await apiClient.patch(`/account/addresses/${id}`, input);
  return res.data;
}

export async function setDefaultAddress(id: number) {
  await apiClient.patch(`/account/addresses/${id}`, { action: "setDefault" });
}

export async function deleteAddress(id: number) {
  await apiClient.delete(`/account/addresses/${id}`);
}

export async function updateNotificationPreferences(
  input: NotificationPreferencesInput,
): Promise<void> {
  await apiClient.put("/account/notifications", input);
}

export async function getReorderItems(orderNumber: string): Promise<ReorderResult> {
  const res = await apiClient.get<ReorderResult>(`/account/orders/${orderNumber}/reorder`);
  return res.data;
}
