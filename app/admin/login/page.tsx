"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/FieldError";
import { adminLogin, type AdminLoginPayload } from "@/lib/api/adminAuth";
import { getApiErrorMessage } from "@/lib/api/error";
import { adminLoginSchema } from "@/lib/validation/admin";

export default function AdminLoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginPayload>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { trigger, isMutating } = useSWRMutation(
    "admin/auth/login",
    (_key, { arg }: { arg: AdminLoginPayload }) => adminLogin(arg),
  );

  async function onSubmit(values: AdminLoginPayload) {
    try {
      await trigger(values);
      toast.success("Welcome back!");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl">🥩</div>
          <div className="font-serif text-xl font-black text-white">WeDoHalal.</div>
          <div className="mt-1 text-xs font-bold tracking-widest text-neutral-500 uppercase">
            Master Admin
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
        >
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold text-neutral-400">
              Email address
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="admin@wedohalal.com"
              {...register("email")}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-red-600"
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-bold text-neutral-400">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password")}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-red-600"
            />
            <FieldError message={errors.password?.message} />
          </div>

          <button
            type="submit"
            disabled={isMutating}
            className="w-full cursor-pointer rounded-lg bg-red-600 py-3 text-sm font-extrabold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {isMutating ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-neutral-600">
          Staff access only. Wholesale customers should sign in at{" "}
          <span className="text-neutral-400">/login</span>.
        </p>
      </div>
    </div>
  );
}
