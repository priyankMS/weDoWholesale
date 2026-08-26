import { PlatformSetting } from "@/lib/db/models/PlatformSetting";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminSettingsPage() {
  const rows = await PlatformSetting.findAll();
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <div className="flex h-full flex-col">
      <AdminPageHeader title="Settings" subtitle="Platform-wide pricing and delivery defaults" />

      <div className="flex-1 overflow-y-auto p-5">
        <SettingsForm
          defaultValues={{
            default_markup_percent: Number(settings.default_markup_percent ?? 15),
            free_delivery_threshold: Number(settings.free_delivery_threshold ?? 150),
            wholesale_min_order_kg: Number(settings.wholesale_min_order_kg ?? 100),
            gst_rate_percent: Number(settings.gst_rate_percent ?? 5),
            maintenance_mode: settings.maintenance_mode === "true",
          }}
        />
      </div>
    </div>
  );
}
