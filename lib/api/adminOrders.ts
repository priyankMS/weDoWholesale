import { apiClient } from "@/lib/api/client";
import type { OrderStatus } from "@/lib/db/models/Order";

export async function updateAdminOrderStatus(id: number, orderStatus: OrderStatus) {
  const res = await apiClient.patch(`/admin/orders/${id}`, { orderStatus });
  return res.data;
}

export async function emailAdminOrderInvoice(id: number) {
  const res = await apiClient.post(`/admin/orders/${id}/invoice`);
  return res.data;
}

export async function addAdminOrderItem(
  orderId: number,
  input: { productId: number; variantId: number; quantity: number; note?: string | null },
) {
  const res = await apiClient.post(`/admin/orders/${orderId}/items`, input);
  return res.data;
}

export async function updateAdminOrderItem(
  orderId: number,
  orderItemId: number,
  input: {
    productId?: number;
    variantId?: number;
    quantity: number;
    unitPrice?: number;
    note?: string | null;
  },
) {
  const res = await apiClient.patch(`/admin/orders/${orderId}/items/${orderItemId}`, input);
  return res.data;
}

export type AdminCatalogueVariant = {
  id: number;
  sku: string | null;
  label: string;
  conditionType: string | null;
  price: number | null;
};

export type AdminCatalogueProduct = {
  id: number;
  name: string;
  category: string;
  unit: string;
  variants: AdminCatalogueVariant[];
};

export async function searchAdminCatalogue(q: string) {
  const res = await apiClient.get<{ products: AdminCatalogueProduct[] }>("/admin/catalogue/search", {
    params: { q },
  });
  return res.data.products;
}
