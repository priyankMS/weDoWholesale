"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/FieldError";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import {
  adminResetPassword,
  type AdminResetPasswordPayload,
} from "@/lib/api/adminAuth";
import { getApiErrorMessage } from "@/lib/api/error";
import { adminResetPasswordSchema } from "@/lib/validation/admin";

export function AdminResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AdminResetPasswordPayload>({
    resolver: zodResolver(adminResetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });
  const passwordValue = useWatch({ control, name: "password" });

  const { trigger, isMutating } = useSWRMutation(
    "admin/auth/reset-password",
    (_key, { arg }: { arg: AdminResetPasswordPayload }) => adminResetPassword(arg),
  );

  async function onSubmit(values: AdminResetPasswordPayload) {
    try {
      await trigger({ ...values, token });
      setDone(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "This reset link is invalid or has expired."));
    }
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <div className="mb-1 text-sm font-extrabold text-white">Invalid link</div>
        <p className="mb-4 text-xs text-neutral-500">
          This reset link is missing its token. Request a new one from the admin login page.
        </p>
        <Link
          href="/admin/forgot-password"
          className="block w-full rounded-lg bg-red-600 py-3 text-center text-sm font-extrabold text-white transition-colors hover:bg-red-700"
        >
          Request a new link →
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <div className="mb-4 rounded-lg border border-green-900 bg-green-950/40 p-4">
          <div className="mb-1 text-sm font-extrabold text-green-400">Password updated</div>
          <p className="text-xs text-neutral-400">
            You&apos;ve been signed out everywhere else for security. Sign in again with your new
            password.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/login")}
          className="w-full cursor-pointer rounded-lg bg-red-600 py-3 text-sm font-extrabold text-white transition-colors hover:bg-red-700"
        >
          Go to sign in →
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
      <div className="mb-5">
        <div className="mb-1 text-sm font-extrabold text-white">Set a new password</div>
        <p className="text-xs text-neutral-500">Choose a new password for your Master Admin account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-bold text-neutral-400">New password</label>
          <PasswordInput
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            {...register("password")}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-red-600"
          />
          <FieldError message={errors.password?.message} />
        </div>

        <div className="mb-2">
          <label className="mb-1.5 block text-xs font-bold text-neutral-400">
            Confirm new password
          </label>
          <PasswordInput
            autoComplete="new-password"
            placeholder="Repeat password"
            {...register("confirmPassword")}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-red-600"
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>
        <PasswordStrength value={passwordValue ?? ""} />

        <button
          type="submit"
          disabled={isMutating}
          className="w-full cursor-pointer rounded-lg bg-red-600 py-3 text-sm font-extrabold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {isMutating ? "Updating…" : "Set new password →"}
        </button>
      </form>
    </div>
  );
}
