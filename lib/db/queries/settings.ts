import { PlatformSetting } from "@/lib/db/models/PlatformSetting";

export type PlatformSettings = {
  defaultMarkupPercent: number;
  freeDeliveryThreshold: number;
  wholesaleMinOrderKg: number;
  gstRatePercent: number;
  maintenanceMode: boolean;
};

const DEFAULTS: PlatformSettings = {
  defaultMarkupPercent: 15,
  freeDeliveryThreshold: 150,
  wholesaleMinOrderKg: 100,
  gstRatePercent: 5,
  maintenanceMode: false,
};

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const rows = await PlatformSetting.findAll();
  const raw = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    defaultMarkupPercent: Number(raw.default_markup_percent ?? DEFAULTS.defaultMarkupPercent),
    freeDeliveryThreshold: Number(raw.free_delivery_threshold ?? DEFAULTS.freeDeliveryThreshold),
    wholesaleMinOrderKg: Number(raw.wholesale_min_order_kg ?? DEFAULTS.wholesaleMinOrderKg),
    gstRatePercent: Number(raw.gst_rate_percent ?? DEFAULTS.gstRatePercent),
    maintenanceMode: raw.maintenance_mode === "true",
  };
}

// Proxy (proxy.ts) checks this on every customer-facing request — a
// single indexed primary-key lookup, cheap enough not to need caching.
export async function isMaintenanceModeOn(): Promise<boolean> {
  const row = await PlatformSetting.findByPk("maintenance_mode");
  return row?.value === "true";
}
