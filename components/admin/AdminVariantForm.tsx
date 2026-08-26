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
  "w-full rounded-md border border-[#d0ccc6] bg-white px-2.5 py-1.5 text-[14px] text-[#1a1816] outline-none focus:border-[#e05a4a]";
const labelClass = "mb-1 block text-[13px] font-semibold tracking-wide text-[#9a9490] uppercase";
const sectionTitleClass =
  "mb-2.5 border-b border-[#e4e1dc] pb-1.5 text-[13px] font-bold tracking-widest text-[#9a9490] uppercase";
const cardClass = "rounded-md border border-[#e4e1dc] bg-white p-5";

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
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Variant Attributes</h2>
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

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Stock &amp; Price</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Base Price ($)</label>
            <input type="number" step="0.01" min="0" {...register("basePrice")} className={inputClass} />
            {errors.basePrice && (
              <p className="mt-1 text-[13px] font-semibold text-[#cc2222]">{errors.basePrice.message}</p>
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
          className="rounded-[5px] border border-[#d0ccc6] bg-white px-4 py-1.5 text-[14px] font-semibold text-[#5a5450] hover:bg-[#f0ede9]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isMutating}
          className="rounded-[5px] bg-[#e05a4a] px-5 py-1.5 text-[14px] font-bold text-white hover:bg-[#c04535] disabled:opacity-60"
        >
          {isMutating ? "Saving…" : "💾 Save Changes"}
        </button>
      </div>
    </form>
  );
}
