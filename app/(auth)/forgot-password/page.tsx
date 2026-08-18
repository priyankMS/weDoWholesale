"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthHero } from "@/components/auth/AuthHero";
import { FormCard, FormField, TextInput } from "@/components/ui/FormCard";
import { Button } from "@/components/ui/Button";
import { NoticeCard } from "@/components/ui/NoticeCard";
import { FieldError } from "@/components/ui/FieldError";
import {
  forgotPassword,
  type ForgotPasswordPayload,
} from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/error";
import { forgotPasswordSchema } from "@/lib/validation/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordPayload>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const { trigger, isMutating } = useSWRMutation(
    "auth/forgot-password",
    (_key, { arg }: { arg: ForgotPasswordPayload }) => forgotPassword(arg),
  );

  async function onSubmit(values: ForgotPasswordPayload) {
    try {
      await trigger(values);
      setSentEmail(values.email);
      setSent(true);
    } catch (err) {
      // The API itself always responds ok (it never reveals whether an
      // account exists for this email), so a real error here means
      // something actually went wrong client-side (network, validation) —
      // surface it instead of silently pretending it sent.
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
    <AuthShell backHref="/login" backLabel="Back to login">
      <AuthHero
        eyebrow="Account recovery"
        title="Forgot your password?"
        sub="Enter the email on your wholesale account. We'll send a reset link valid for 1 hour."
      />

      {!sent ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Your account email
          </div>
          <FormCard>
            <FormField label="Email address">
              <TextInput
                type="email"
                autoComplete="email"
                placeholder="yourrestaurant@email.com"
                {...register("email")}
              />
            </FormField>
          </FormCard>
          <FieldError message={errors.email?.message} />

          <Button type="submit" disabled={isMutating}>
            {isMutating ? "Sending…" : "Send reset link →"}
          </Button>
          <div className="mt-3 mb-3.5 text-center text-[0.84rem]">
            <Link href="/login" className="font-bold text-primary-500">
              I remember my password
            </Link>
          </div>

          <NoticeCard icon="⚠️" title="Can't find your email?" tone="warning">
            If you registered with a different email or are locked out,
            message us on WhatsApp and we&apos;ll sort it out manually.
          </NoticeCard>
          <Button
            variant="whatsapp"
            type="button"
            onClick={() =>
              window.open(
                "https://wa.me/17807227623?text=Hi%20WeDoHalal%2C%20I%20have%20a%20question%20about%20my%20wholesale%20account.",
                "_blank",
              )
            }
          >
            💬 Get help via WhatsApp
          </Button>
        </form>
      ) : (
        <>
          <div className="mb-4 flex items-start gap-3 rounded-2xl border-[1.5px] border-green-200 bg-green-50 p-4.5">
            <div className="shrink-0 text-2xl leading-none">✉️</div>
            <div className="text-[0.82rem] leading-relaxed font-semibold text-green-600">
              <strong>Reset link sent.</strong> Check your inbox — the link
              expires in 1 hour. Check your spam folder if you don&apos;t see
              it within a few minutes.
            </div>
          </div>

          <NoticeCard icon="🔒" title="Link sent to your email">
            Click the link in the email, set a new password, and you&apos;ll
            be back in your wholesale account immediately.
          </NoticeCard>

          <Link href="/login" className="block">
            <Button type="button">Back to sign in →</Button>
          </Link>
          <Button
            variant="ghost"
            type="button"
            className="mt-3"
            onClick={resend}
            disabled={isMutating}
          >
            {isMutating ? "Resending…" : "Resend the link"}
          </Button>
        </>
      )}
    </AuthShell>
  );
}
