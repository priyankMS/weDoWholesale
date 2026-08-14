import { apiClient } from "@/lib/api/client";
import type { ProductSummary } from "@/lib/db/queries/catalogue";

export type { ProductSummary };

export async function fetchAllProducts(): Promise<ProductSummary[]> {
  const res = await apiClient.get<{ products: ProductSummary[] }>(
    "/catalogue/products",
  );
  return res.data.products;
}

export async function fetchSavedIds(): Promise<number[]> {
  const res = await apiClient.get<{ productIds: number[] }>("/saved");
  return res.data.productIds;
}

export async function toggleSaved(productId: number): Promise<{ saved: boolean }> {
  const res = await apiClient.post<{ saved: boolean }>("/saved", { productId });
  return res.data;
}
