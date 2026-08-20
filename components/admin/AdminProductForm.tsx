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
  "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-[0.86rem] outline-none focus:border-red-500";
const labelClass = "mb-1.5 block text-[0.72rem] font-bold text-neutral-500";

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
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-[0.82rem] font-extrabold text-neutral-900">Product Info</h2>
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

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-[0.82rem] font-extrabold text-neutral-900">Descriptions</h2>
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

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-[0.82rem] font-extrabold text-neutral-900">SEO</h2>
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
