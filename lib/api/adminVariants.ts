import { apiClient } from "@/lib/api/client";
import type {
  AdminVariantCreateInput,
  AdminVariantUpdateInput,
} from "@/lib/validation/adminVariants";

export async function createAdminVariant(payload: AdminVariantCreateInput) {
  const res = await apiClient.post<{ variant: { id: number } }>(`/admin/variants`, payload);
  return res.data;
}

export async function updateAdminVariant(id: number, payload: AdminVariantUpdateInput) {
  const res = await apiClient.patch(`/admin/variants/${id}`, payload);
  return res.data;
}

export async function deleteAdminVariant(id: number) {
  const res = await apiClient.delete(`/admin/variants/${id}`);
  return res.data;
}

export type AdminVariantFacets = {
  conditions: string[];
  cutTypes: string[];
  bones: string[];
  skins: string[];
  fatLevels: string[];
  origins: string[];
};

export async function getAdminVariantFacets(): Promise<AdminVariantFacets> {
  const res = await apiClient.get<{ facets: AdminVariantFacets }>(`/admin/variants/facets`);
  return res.data.facets;
}
