"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/FieldError";
import {
  adminForgotPassword,
  type AdminForgotPasswordPayload,
} from "@/lib/api/adminAuth";
import { getApiErrorMessage } from "@/lib/api/error";
import { adminForgotPasswordSchema } from "@/lib/validation/admin";

export default function AdminForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<AdminForgotPasswordPayload>({
    resolver: zodResolver(adminForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const { trigger, isMutating } = useSWRMutation(
    "admin/auth/forgot-password",
    (_key, { arg }: { arg: AdminForgotPasswordPayload }) => adminForgotPassword(arg),
  );

  async function onSubmit(values: AdminForgotPasswordPayload) {
    try {
      await trigger(values);
      setSentEmail(values.email);
      setSent(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function resend() {
    try {
      await trigger({ email: sentEmail || getValues("email") });
      toast.success("Reset link sent again.");
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

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          {!sent ? (
            <>
              <div className="mb-5">
                <div className="mb-1 text-sm font-extrabold text-white">Forgot your password?</div>
                <p className="text-xs text-neutral-500">
                  Enter your admin email and we&apos;ll send a reset link valid for 1 hour.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-5">
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

                <button
                  type="submit"
                  disabled={isMutating}
                  className="w-full cursor-pointer rounded-lg bg-red-600 py-3 text-sm font-extrabold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                >
                  {isMutating ? "Sending…" : "Send reset link →"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-4 rounded-lg border border-green-900 bg-green-950/40 p-4">
                <div className="mb-1 text-sm font-extrabold text-green-400">Reset link sent</div>
                <p className="text-xs text-neutral-400">
                  Check your inbox — the link expires in 1 hour. Check spam if you don&apos;t see it within
                  a few minutes.
                </p>
              </div>
              <button
                type="button"
                onClick={resend}
                disabled={isMutating}
                className="w-full cursor-pointer rounded-lg border border-neutral-700 bg-neutral-950 py-3 text-sm font-extrabold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
              >
                {isMutating ? "Resending…" : "Resend the link"}
              </button>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-neutral-600">
          <Link href="/admin/login" className="font-bold text-neutral-400 hover:text-white">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
