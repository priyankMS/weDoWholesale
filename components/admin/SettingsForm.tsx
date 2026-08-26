"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { updateAdminSettings } from "@/lib/api/adminSettings";
import { getApiErrorMessage } from "@/lib/api/error";
import {
  adminSettingsSchema,
  type AdminSettingsForm as AdminSettingsFormValues,
  type AdminSettingsInput,
} from "@/lib/validation/adminSettings";

const rowInputClass =
  "w-24 rounded-md border border-[#d0ccc6] bg-white px-2 py-1 text-right font-[family-name:var(--font-plex-mono)] text-[14px] text-[#1a1816] outline-none focus:border-[#e05a4a]";

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[#e4e1dc] px-3.5 py-2.5 last:border-0">
      <span className="text-[14px] font-semibold text-[#1a1816]">{label}</span>
      {children}
    </div>
  );
}

export function SettingsForm({ defaultValues }: { defaultValues: AdminSettingsFormValues }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminSettingsFormValues>({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues,
  });

  const { trigger, isMutating } = useSWRMutation(
    "admin/settings",
    (_key, { arg }: { arg: AdminSettingsInput }) => updateAdminSettings(arg),
  );

  async function onSubmit(values: AdminSettingsFormValues) {
    try {
      await trigger(adminSettingsSchema.parse(values));
      toast.success("Settings saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-[600px]">
      <div className="mb-2.5 text-[13px] font-bold tracking-widest text-[#9a9490] uppercase">
        Platform Settings
      </div>
      <div className="mb-3.5 overflow-hidden rounded-md border border-[#e4e1dc] bg-white">
        <SettingRow label="Default Markup %">
          <input type="number" step="0.1" {...register("default_markup_percent")} className={rowInputClass} />
        </SettingRow>
        <SettingRow label="Free Delivery Threshold (Retail, $)">
          <input type="number" step="0.01" {...register("free_delivery_threshold")} className={rowInputClass} />
        </SettingRow>
        <SettingRow label="Wholesale Min Order (kg)">
          <input type="number" step="1" {...register("wholesale_min_order_kg")} className={rowInputClass} />
        </SettingRow>
        <SettingRow label="GST Rate %">
          <input type="number" step="0.1" {...register("gst_rate_percent")} className={rowInputClass} />
        </SettingRow>
      </div>
      {(errors.default_markup_percent || errors.free_delivery_threshold) && (
        <p className="mb-3 text-[13px] font-semibold text-[#cc2222]">
          {errors.default_markup_percent?.message || errors.free_delivery_threshold?.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isMutating}
        className="rounded-[5px] bg-[#e05a4a] px-4 py-1.5 text-[14px] font-bold text-white hover:bg-[#c04535] disabled:opacity-60"
      >
        {isMutating ? "Saving…" : "💾 Save Settings"}
      </button>

      <div className="mt-6 overflow-hidden rounded-md border border-[#f5c4be] bg-[#fff8e0]">
        <div className="p-4">
          <div className="mb-1 text-[14px] font-bold text-[#1a1816]">Maintenance Mode</div>
          <p className="mb-3 text-[13px] text-[#5a5450]">
            When on, every customer-facing page (catalogue, cart, checkout, account) redirects to
            a maintenance notice. The admin panel stays accessible so you can turn it back off.
          </p>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("maintenance_mode")} className="h-4 w-4 accent-[#c48a00]" />
            <span className="text-[14px] font-bold text-[#1a1816]">Site is in maintenance mode</span>
          </label>
        </div>
      </div>
    </form>
  );
}
