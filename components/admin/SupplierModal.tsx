"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createAdminSupplier, updateAdminSupplier } from "@/lib/api/adminSuppliers";
import { getApiErrorMessage } from "@/lib/api/error";
import { adminSupplierSchema, type AdminSupplierInput } from "@/lib/validation/adminSuppliers";

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-[0.86rem] outline-none focus:border-red-500";
const labelClass = "mb-1.5 block text-[0.72rem] font-bold text-neutral-500";

type SupplierData = AdminSupplierInput & { id?: number };

export function SupplierModal({
  trigger,
  supplier,
}: {
  trigger: React.ReactNode;
  supplier?: SupplierData;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminSupplierInput>({
    resolver: zodResolver(adminSupplierSchema),
    defaultValues: supplier ?? {
      name: "",
      contactName: "",
      phone: "",
      email: "",
      paymentTerms: "",
      halalCertStatus: "Certified",
      isActive: true,
    },
  });

  async function onSubmit(values: AdminSupplierInput) {
    setSaving(true);
    try {
      if (supplier?.id) {
        await updateAdminSupplier(supplier.id, values);
        toast.success("Supplier updated");
      } else {
        await createAdminSupplier(values);
        toast.success("Supplier added");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="mb-4 text-[0.9rem] font-extrabold text-neutral-900">
              {supplier?.id ? "Edit Supplier" : "Add Supplier"}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
              <div>
                <label className={labelClass}>Supplier Name</label>
                <input {...register("name")} className={inputClass} />
                {errors.name && (
                  <p className="mt-1 text-[0.72rem] font-semibold text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Contact Name</label>
                <input {...register("contactName")} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input {...register("phone")} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input {...register("email")} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Payment Terms</label>
                  <input {...register("paymentTerms")} placeholder="Net-30" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Halal Cert</label>
                  <input {...register("halalCertStatus")} className={inputClass} />
                </div>
              </div>
              <label className="flex items-center gap-1.5 text-[0.82rem] text-neutral-600">
                <input type="checkbox" {...register("isActive")} className="h-3.5 w-3.5" />
                Active
              </label>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-[0.82rem] font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-red-600 px-4 py-2 text-[0.82rem] font-bold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
