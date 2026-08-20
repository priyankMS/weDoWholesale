"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/FieldError";
import { createAdminProduct } from "@/lib/api/adminProducts";
import { getApiErrorMessage } from "@/lib/api/error";
import {
  adminProductCreateSchema,
  type AdminProductCreateForm as AdminProductCreateFormValues,
  type AdminProductCreateInput,
} from "@/lib/validation/adminProducts";

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-[0.86rem] outline-none focus:border-red-500";
const labelClass = "mb-1.5 block text-[0.72rem] font-bold text-neutral-500";

export function AdminProductCreateForm({
  suppliers,
}: {
  suppliers: { id: number; name: string }[];
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminProductCreateFormValues>({
    resolver: zodResolver(adminProductCreateSchema),
    defaultValues: { unit: "kg", stockCount: 0 },
  });

  const { trigger, isMutating } = useSWRMutation(
    "admin/products/new",
    (_key, { arg }: { arg: AdminProductCreateInput }) => createAdminProduct(arg),
  );

  async function onSubmit(values: AdminProductCreateFormValues) {
    try {
      const { productId } = await trigger(adminProductCreateSchema.parse(values));
      toast.success("Product created");
      router.push(`/admin/products/${productId}`);
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
            <input {...register("item")} className={inputClass} placeholder="Whole Chicken" />
            <FieldError message={errors.item?.message} />
          </div>
          <div>
            <label className={labelClass}>SKU</label>
            <input {...register("sku")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <input {...register("category")} className={inputClass} placeholder="Chicken" />
            <FieldError message={errors.category?.message} />
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

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-1 text-[0.82rem] font-extrabold text-neutral-900">First Variant</h2>
        <p className="mb-4 text-[0.76rem] text-neutral-500">
          Every product needs at least one variant to show a price and stock state in the
          catalogue. Add more cuts/variants afterward from Variants &amp; SKUs.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Variant Label</label>
            <input {...register("variantLabel")} className={inputClass} placeholder="Standard" />
          </div>
          <div>
            <label className={labelClass}>Unit</label>
            <input {...register("unit")} className={inputClass} placeholder="kg" />
            <FieldError message={errors.unit?.message} />
          </div>
          <div>
            <label className={labelClass}>Stock Count</label>
            <input type="number" {...register("stockCount")} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-1 text-[0.82rem] font-extrabold text-neutral-900">Pricing (optional)</h2>
        <p className="mb-4 text-[0.76rem] text-neutral-500">
          Leave blank to add pricing later from Price Control — variants without pricing show up
          there under &quot;Variants without pricing&quot;.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className={labelClass}>Supplier</label>
            <select {...register("supplierId")} className={inputClass}>
              <option value="">No supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Dealer Price</label>
            <input type="number" step="0.01" {...register("dealerPrice")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Markup $</label>
            <input type="number" step="0.01" {...register("priceIncrement")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Retail Price</label>
            <input type="number" step="0.01" {...register("retailPrice")} className={inputClass} />
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
          {isMutating ? "Creating…" : "+ Create Product"}
        </button>
      </div>
    </form>
  );
}
