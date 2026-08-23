import { apiClient } from "@/lib/api/client";
import type { AdminProductCreateInput, AdminProductUpdateInput } from "@/lib/validation/adminProducts";
import type { AdminVariantRow } from "@/lib/db/queries/adminVariants";
import type { ProductPricingVariant } from "@/lib/db/queries/adminPricing";

export type AdminProductDetail = {
  product: {
    id: number;
    item: string;
    category: string | null;
    type: string | null;
    sku: string | null;
    shortDesc: string | null;
    longDesc1: string | null;
    metaTitle: string | null;
    metaDesc: string | null;
    thumbnailAlt: string | null;
    thumbnail: string | null;
    image1: string | null;
    image1Alt: string | null;
    image2: string | null;
    image2Alt: string | null;
    image3: string | null;
    image3Alt: string | null;
  };
  variants: AdminVariantRow[];
  pricing: ProductPricingVariant[];
  facets: { conditions: string[]; bones: string[]; skins: string[] };
  categories: string[];
};

export async function getAdminProductDetail(id: number) {
  const res = await apiClient.get<AdminProductDetail>(`/admin/products/${id}`);
  return res.data;
}

export async function updateAdminProduct(id: number, payload: AdminProductUpdateInput) {
  const res = await apiClient.patch(`/admin/products/${id}`, payload);
  return res.data;
}

export async function createAdminProduct(payload: AdminProductCreateInput) {
  const res = await apiClient.post<{ productId: number }>("/admin/products", payload);
  return res.data;
}
