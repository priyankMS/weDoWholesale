"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { updateAdminVariant } from "@/lib/api/adminVariants";
import { getApiErrorMessage } from "@/lib/api/error";
import {
  adminVariantUpdateSchema,
  type AdminVariantUpdateForm,
  type AdminVariantUpdateInput,
} from "@/lib/validation/adminVariants";

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-[0.86rem] outline-none focus:border-red-500";
const labelClass = "mb-1.5 block text-[0.8rem] font-bold text-neutral-500";

export function AdminVariantForm({
  variantId,
  defaultValues,
}: {
  variantId: number;
  defaultValues: AdminVariantUpdateForm;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminVariantUpdateForm>({
    resolver: zodResolver(adminVariantUpdateSchema),
    defaultValues,
  });

  const { trigger, isMutating } = useSWRMutation(
    `admin/variants/${variantId}`,
    (_key, { arg }: { arg: AdminVariantUpdateInput }) => updateAdminVariant(variantId, arg),
  );

  async function onSubmit(values: AdminVariantUpdateForm) {
    try {
      await trigger(adminVariantUpdateSchema.parse(values));
      toast.success("Variant saved");
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-[0.9rem] font-extrabold text-neutral-900">Variant Attributes</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>SKU</label>
            <input {...register("sku")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Condition</label>
            <input {...register("conditionType")} placeholder="Fresh / Frozen" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cut Style</label>
            <input {...register("cutType")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Bone</label>
            <input {...register("boneType")} placeholder="Bone-in / Boneless" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Skin</label>
            <input {...register("skinType")} placeholder="With Skin / Skinless" className={inputClass} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-[0.9rem] font-extrabold text-neutral-900">Stock &amp; Price</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Base Price ($)</label>
            <input type="number" step="0.01" min="0" {...register("basePrice")} className={inputClass} />
            {errors.basePrice && (
              <p className="mt-1 text-[0.8rem] font-semibold text-red-600">
                {errors.basePrice.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Stock Count</label>
            <input type="number" step="1" min="0" {...register("stockCount")} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2.5">
        <button
          type="button"
          onClick={() => router.push("/admin/variants")}
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-[0.84rem] font-bold text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isMutating}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-[0.84rem] font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isMutating ? "Saving…" : "💾 Save Changes"}
        </button>
      </div>
    </form>
  );
}
