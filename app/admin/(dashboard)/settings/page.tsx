import { PlatformSetting } from "@/lib/db/models/PlatformSetting";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const rows = await PlatformSetting.findAll();
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="font-serif text-xl font-black text-neutral-900">Settings</h1>
        <p className="text-[0.9rem] text-neutral-500">Platform-wide pricing and delivery defaults</p>
      </div>

      <SettingsForm
        defaultValues={{
          default_markup_percent: Number(settings.default_markup_percent ?? 15),
          free_delivery_threshold: Number(settings.free_delivery_threshold ?? 150),
          wholesale_min_order_kg: Number(settings.wholesale_min_order_kg ?? 100),
          gst_rate_percent: Number(settings.gst_rate_percent ?? 5),
        }}
      />
    </div>
  );
}
