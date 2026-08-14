"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import useSWRMutation from "swr/mutation";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthHero } from "@/components/auth/AuthHero";
import { FormCard, FormField, TextInput } from "@/components/ui/FormCard";
import { Button } from "@/components/ui/Button";
import { NoticeCard } from "@/components/ui/NoticeCard";
import {
  forgotPassword,
  type ForgotPasswordPayload,
} from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const { trigger, isMutating } = useSWRMutation(
    "auth/forgot-password",
    (_key, { arg }: { arg: ForgotPasswordPayload }) => forgotPassword(arg),
  );

  async function sendResetLink(e: FormEvent) {
    e.preventDefault();
    try {
      await trigger({ email });
    } catch {
      // Always show the same "sent" state regardless of outcome — the API
      // itself never reveals whether an account exists for this email, so
      // the UI shouldn't either.
    } finally {
      setSent(true);
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
        <form onSubmit={sendResetLink}>
          <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Your account email
          </div>
          <FormCard>
            <FormField label="Email address">
              <TextInput
                type="email"
                required
                autoComplete="email"
                placeholder="yourrestaurant@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>
          </FormCard>

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
            onClick={sendResetLink}
          >
            Resend the link
          </Button>
        </>
      )}
    </AuthShell>
  );
}
