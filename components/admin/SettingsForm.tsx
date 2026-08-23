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

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-[0.86rem] outline-none focus:border-red-500";
const labelClass = "mb-1.5 block text-[0.8rem] font-bold text-neutral-500";

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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-lg">
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-[0.9rem] font-extrabold text-neutral-900">Platform Settings</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Default Markup %</label>
            <input
              type="number"
              step="0.1"
              {...register("default_markup_percent")}
              className={inputClass}
            />
            {errors.default_markup_percent && (
              <p className="mt-1 text-[0.8rem] font-semibold text-red-600">
                {errors.default_markup_percent.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Free Delivery Threshold (Retail, $)</label>
            <input
              type="number"
              step="0.01"
              {...register("free_delivery_threshold")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Wholesale Min Order (kg)</label>
            <input
              type="number"
              step="1"
              {...register("wholesale_min_order_kg")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>GST Rate %</label>
            <input type="number" step="0.1" {...register("gst_rate_percent")} className={inputClass} />
          </div>
        </div>

        <button
          type="submit"
          disabled={isMutating}
          className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-[0.84rem] font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isMutating ? "Saving…" : "Save Settings"}
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="mb-1 text-[0.9rem] font-extrabold text-neutral-900">Maintenance Mode</h2>
        <p className="mb-4 text-[0.82rem] text-neutral-600">
          When on, every customer-facing page (catalogue, cart, checkout, account) redirects to
          a maintenance notice. The admin panel stays accessible so you can turn it back off.
        </p>
        <label className="flex items-center gap-2.5">
          <input type="checkbox" {...register("maintenance_mode")} className="h-4 w-4" />
          <span className="text-[0.86rem] font-bold text-neutral-900">
            Site is in maintenance mode
          </span>
        </label>
      </div>
    </form>
  );
}
