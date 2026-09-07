"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthHero } from "@/components/auth/AuthHero";
import { FormCard, FormField } from "@/components/ui/FormCard";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { Button } from "@/components/ui/Button";
import { NoticeCard } from "@/components/ui/NoticeCard";
import { FieldError } from "@/components/ui/FieldError";
import { resetPassword, type ResetPasswordPayload } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/error";
import { resetPasswordSchema } from "@/lib/validation/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordPayload>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });
  const passwordValue = useWatch({ control, name: "password" });

  const { trigger, isMutating } = useSWRMutation(
    "auth/reset-password",
    (_key, { arg }: { arg: ResetPasswordPayload }) => resetPassword(arg),
  );

  async function onSubmit(values: ResetPasswordPayload) {
    try {
      await trigger({ ...values, token });
      setDone(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "This reset link is invalid or has expired."));
    }
  }

  if (!token) {
    return (
      <AuthShell backHref="/forgot-password" backLabel="Request a new link">
        <AuthHero
          eyebrow="Account recovery"
          title="Invalid link"
          sub="This reset link is missing its token."
        />
        <NoticeCard icon="⚠️" title="Link incomplete" tone="warning">
          Open the reset link from your email again, or request a new one below.
        </NoticeCard>
        <Link href="/forgot-password" className="mt-3.5 block">
          <Button type="button">Request a new link →</Button>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell backHref="/login" backLabel="Back to login">
      <AuthHero
        eyebrow="Account recovery"
        title="Set a new password"
        sub="Choose a new password for your wholesale account."
      />

      {!done ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormCard>
            <FormField label="New password">
              <PasswordInput
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                {...register("password")}
              />
            </FormField>
            <FormField label="Confirm new password">
              <PasswordInput
                autoComplete="new-password"
                placeholder="Repeat password"
                {...register("confirmPassword")}
              />
            </FormField>
          </FormCard>
          <FieldError message={errors.password?.message} />
          <FieldError message={errors.confirmPassword?.message} />
          <PasswordStrength value={passwordValue ?? ""} />

          <Button type="submit" disabled={isMutating}>
            {isMutating ? "Updating…" : "Set new password →"}
          </Button>
        </form>
      ) : (
        <>
          <div className="mb-4 flex items-start gap-3 rounded-2xl border-[1.5px] border-green-200 bg-green-50 p-4.5">
            <div className="shrink-0 text-2xl leading-none">✅</div>
            <div className="text-[0.82rem] leading-relaxed font-semibold text-green-600">
              <strong>Password updated.</strong> You&apos;ve been signed out everywhere else for
              security — sign in again with your new password.
            </div>
          </div>
          <Button type="button" onClick={() => router.push("/login")}>
            Go to sign in →
          </Button>
        </>
      )}
    </AuthShell>
  );
}
