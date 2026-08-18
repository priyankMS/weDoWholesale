import { apiClient } from "@/lib/api/client";
import type {
  ProductFacets,
  ProductQuerySort,
  ProductSummary,
  StockState,
} from "@/lib/db/queries/catalogue";

export type { ProductSummary, ProductFacets };

export async function fetchAllProducts(): Promise<ProductSummary[]> {
  const res = await apiClient.get<{ products: ProductSummary[] }>(
    "/catalogue/products",
  );
  return res.data.products;
}

export type ProductPageParams = {
  category: string;
  q?: string;
  type?: string;
  condition?: string[];
  bone?: string[];
  skin?: string[];
  stock?: StockState[];
  priceMin?: number | null;
  priceMax?: number | null;
  sort?: ProductQuerySort;
  page: number;
  pageSize?: number;
};

export type ProductPageResult = {
  products: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  facets: ProductFacets;
};

// Query-string builder for the paginated/filtered catalogue endpoint —
// every list-valued filter is sent as a comma-separated param, empty
// values are omitted entirely rather than sent as "" (keeps the URL, and
// the SWR cache key derived from it, clean).
export async function fetchProductPage(params: ProductPageParams): Promise<ProductPageResult> {
  const sp = new URLSearchParams();
  sp.set("category", params.category);
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.type && params.type !== "All") sp.set("type", params.type);
  if (params.condition?.length) sp.set("condition", params.condition.join(","));
  if (params.bone?.length) sp.set("bone", params.bone.join(","));
  if (params.skin?.length) sp.set("skin", params.skin.join(","));
  if (params.stock?.length) sp.set("stock", params.stock.join(","));
  if (params.priceMin != null) sp.set("priceMin", String(params.priceMin));
  if (params.priceMax != null) sp.set("priceMax", String(params.priceMax));
  sp.set("sort", params.sort ?? "default");
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize ?? 10));

  const res = await apiClient.get<ProductPageResult>(`/catalogue/products?${sp.toString()}`);
  return res.data;
}

export async function fetchSavedIds(): Promise<number[]> {
  const res = await apiClient.get<{ productIds: number[] }>("/saved");
  return res.data.productIds;
}

export async function toggleSaved(productId: number): Promise<{ saved: boolean }> {
  const res = await apiClient.post<{ saved: boolean }>("/saved", { productId });
  return res.data;
}
