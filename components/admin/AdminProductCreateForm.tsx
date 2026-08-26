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
  "w-full rounded-md border border-[#d0ccc6] bg-white px-2.5 py-1.5 text-[14px] text-[#1a1816] outline-none focus:border-[#e05a4a]";
const labelClass = "mb-1 block text-[13px] font-semibold tracking-wide text-[#9a9490] uppercase";
const sectionTitleClass =
  "mb-2.5 border-b border-[#e4e1dc] pb-1.5 text-[13px] font-bold tracking-widest text-[#9a9490] uppercase";
const cardClass = "rounded-md border border-[#e4e1dc] bg-white p-5";

export function AdminProductCreateForm({
  suppliers,
  categories,
  typesByCategory,
}: {
  suppliers: { id: number; name: string }[];
  categories: string[];
  typesByCategory: Record<string, string[]>;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AdminProductCreateFormValues>({
    resolver: zodResolver(adminProductCreateSchema),
    defaultValues: { unit: "kg", stockCount: 0 },
  });

  const selectedCategory = watch("category");
  const types = typesByCategory[selectedCategory] ?? [];

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
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Product Info</h2>
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
            <select {...register("category")} className={inputClass} defaultValue="">
              <option value="" disabled>
                Select a category…
              </option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <FieldError message={errors.category?.message} />
          </div>
          <div>
            <label className={labelClass}>Type / Part</label>
            <input {...register("type")} className={inputClass} list="product-type-options" />
            <datalist id="product-type-options">
              {types.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
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

      <div className={cardClass}>
        <h2 className="mb-1 text-[14px] font-extrabold text-[#1a1816]">First Variant</h2>
        <p className="mb-4 text-[13px] text-[#9a9490]">
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
            <input {...register("unit")} className={inputClass} placeholder="kg" list="unit-options" />
            <datalist id="unit-options">
              <option value="kg" />
              <option value="lb" />
              <option value="pack" />
              <option value="unit" />
            </datalist>
            <FieldError message={errors.unit?.message} />
          </div>
          <div>
            <label className={labelClass}>Stock Count</label>
            <input type="number" {...register("stockCount")} className={inputClass} />
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="mb-1 text-[14px] font-extrabold text-[#1a1816]">Pricing (optional)</h2>
        <p className="mb-4 text-[13px] text-[#9a9490]">
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
          className="rounded-[5px] border border-[#d0ccc6] bg-white px-4 py-1.5 text-[14px] font-semibold text-[#5a5450] hover:bg-[#f0ede9]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isMutating}
          className="rounded-[5px] bg-[#e05a4a] px-5 py-1.5 text-[14px] font-bold text-white hover:bg-[#c04535] disabled:opacity-60"
        >
          {isMutating ? "Creating…" : "+ Create Product"}
        </button>
      </div>
    </form>
  );
}
