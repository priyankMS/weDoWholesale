"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/FieldError";
import { updateAdminProduct } from "@/lib/api/adminProducts";
import { getApiErrorMessage } from "@/lib/api/error";
import {
  adminProductUpdateSchema,
  type AdminProductUpdateInput,
} from "@/lib/validation/adminProducts";

const inputClass =
  "w-full rounded-md border border-[#d0ccc6] bg-white px-2.5 py-1.5 text-[14px] text-[#1a1816] outline-none focus:border-[#e05a4a]";
const labelClass = "mb-1 block text-[13px] font-semibold tracking-wide text-[#9a9490] uppercase";
const sectionTitleClass =
  "mb-2.5 border-b border-[#e4e1dc] pb-1.5 text-[13px] font-bold tracking-widest text-[#9a9490] uppercase";
const cardClass = "rounded-md border border-[#e4e1dc] bg-white p-5";

export function AdminProductForm({
  productId,
  defaultValues,
}: {
  productId: number;
  defaultValues: AdminProductUpdateInput;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminProductUpdateInput>({
    resolver: zodResolver(adminProductUpdateSchema),
    defaultValues,
  });

  const { trigger, isMutating } = useSWRMutation(
    `admin/products/${productId}`,
    (_key, { arg }: { arg: AdminProductUpdateInput }) => updateAdminProduct(productId, arg),
  );

  async function onSubmit(values: AdminProductUpdateInput) {
    try {
      await trigger(values);
      toast.success("Product saved");
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Product Info</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Product Name</label>
            <input {...register("item")} className={inputClass} />
            <FieldError message={errors.item?.message} />
          </div>
          <div>
            <label className={labelClass}>SKU</label>
            <input {...register("sku")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <input {...register("category")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Type / Part</label>
            <input {...register("type")} className={inputClass} />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Descriptions</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Short Description</label>
            <textarea {...register("shortDesc")} rows={2} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Long Description</label>
            <textarea {...register("longDesc1")} rows={4} className={inputClass} />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>SEO</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Meta Title</label>
            <input {...register("metaTitle")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Meta Description</label>
            <textarea {...register("metaDesc")} rows={2} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Thumbnail Alt Text</label>
            <input {...register("thumbnailAlt")} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2.5">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
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
