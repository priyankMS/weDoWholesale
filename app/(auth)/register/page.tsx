"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWRMutation from "swr/mutation";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthHero } from "@/components/auth/AuthHero";
import { FormCard, FormField, TextInput, Select } from "@/components/ui/FormCard";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { BusinessTypeGrid } from "@/components/ui/BusinessTypeGrid";
import { Timeline } from "@/components/ui/Timeline";
import type { BusinessType, MonthlyVolume } from "@/lib/db/models/User";
import { register, type RegisterPayload } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/error";

const CITIES = [
  "Edmonton",
  "Calgary",
  "Sherwood Park",
  "St. Albert",
  "Spruce Grove",
  "Fort Saskatchewan",
  "Leduc",
  "Other Alberta city",
];

const VOLUMES: { value: MonthlyVolume; label: string }[] = [
  { value: "under_50kg", label: "Under 50 kg" },
  { value: "50_100kg", label: "50 – 100 kg" },
  { value: "100_200kg", label: "100 – 200 kg" },
  { value: "200_500kg", label: "200 – 500 kg" },
  { value: "500kg_plus", label: "500 kg+" },
];

const ROLES = ["Owner", "Manager", "Purchasing / Procurement", "Chef", "Other"];

type FormState = {
  businessType: BusinessType | null;
  businessName: string;
  city: string;
  address: string;
  monthlyVolume: MonthlyVolume | "";
  contactName: string;
  role: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
};

const INITIAL_STATE: FormState = {
  businessType: "restaurant",
  businessName: "",
  city: "",
  address: "",
  monthlyVolume: "",
  contactName: "",
  role: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agreeTerms: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { trigger, isMutating } = useSWRMutation(
    "auth/register",
    (_key, { arg }: { arg: RegisterPayload }) => register(arg),
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleStep1Continue(e: FormEvent) {
    e.preventDefault();
    setStep(1);
  }

  async function handleStep2Submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      // Business type defaults to "restaurant" and every other required
      // field is guarded by the form's own `required` attributes, so by
      // the time step 2 submits, form already satisfies RegisterPayload.
      await trigger(form as RegisterPayload);
      setSubmitted(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  if (submitted) {
    return (
      <AuthShell>
        <div className="pt-2 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary-200 bg-primary-50 text-4xl">
            📋
          </div>
          <h1 className="mb-2.5 font-serif text-2xl font-black text-neutral-900">
            Application received!
          </h1>
          <p className="mb-7 text-[0.88rem] leading-relaxed text-neutral-700">
            We&apos;ve got your details. A member of our team will review and
            approve your account within <strong>24 hours</strong> — usually
            much sooner.
          </p>
        </div>

        <Timeline
          items={[
            {
              status: "done",
              icon: "✓",
              title: "Application submitted",
              desc: "We've received your business details and contact info.",
            },
            {
              status: "active",
              icon: "⏳",
              title: "Account review (in progress)",
              desc: "Our team verifies business type and location. Usually done within a few hours.",
            },
            {
              status: "pending",
              icon: "",
              title: "Approval notification",
              desc: "You'll get an email and WhatsApp message with your login link once approved.",
            },
            {
              status: "pending",
              icon: "",
              title: "Start ordering",
              desc: "Browse our full product catalogue and place your first bulk order.",
            },
          ]}
        />

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
          💬 Message us on WhatsApp
        </Button>
        <Button
          variant="ghost"
          type="button"
          className="mt-3"
          onClick={() => router.push("/pending")}
        >
          Go to my account
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      backHref={step === 0 ? "/login" : undefined}
      backLabel="Back"
    >
      {step === 1 && (
        <button
          type="button"
          onClick={() => setStep(0)}
          className="mb-3 flex items-center gap-1.5 text-[0.88rem] font-bold text-primary-500 lg:hidden"
        >
          ← Back
        </button>
      )}

      <StepIndicator
        step={step}
        total={3}
        label={step === 0 ? "Business information" : "Your contact details"}
      />

      {step === 0 && (
        <form onSubmit={handleStep1Continue}>
          <AuthHero
            eyebrow="Get started"
            title="Tell us about your business"
            sub="Wholesale accounts are manually reviewed. You'll get access within 24 hours of applying."
          />

          <div className="mb-1 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            What type of business are you?
          </div>
          <BusinessTypeGrid
            value={form.businessType}
            onChange={(v) => update("businessType", v)}
          />

          <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Business details
          </div>
          <FormCard>
            <FormField label="Business name">
              <TextInput
                required
                placeholder="Al-Noor Restaurant"
                value={form.businessName}
                onChange={(e) => update("businessName", e.target.value)}
              />
            </FormField>
            <FormField label="City">
              <Select
                required
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              >
                <option value="">Select your city</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Business address">
              <TextInput
                required
                placeholder="123 Halal Ave, Edmonton, AB"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </FormField>
          </FormCard>

          <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Estimated monthly need
          </div>
          <FormCard>
            <FormField label="Approx. volume per month (kg)">
              <Select
                required
                value={form.monthlyVolume}
                onChange={(e) =>
                  update("monthlyVolume", e.target.value as MonthlyVolume)
                }
              >
                <option value="">Select a range</option>
                {VOLUMES.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </FormCard>

          <Button type="submit">Continue to Step 2 →</Button>
          <div className="mt-3 text-center text-[0.84rem]">
            <Link href="/login" className="font-bold text-primary-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={handleStep2Submit}>
          <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Contact person
          </div>
          <FormCard>
            <FormField label="Full name">
              <TextInput
                required
                autoComplete="name"
                placeholder="Ahmed Al-Hassan"
                value={form.contactName}
                onChange={(e) => update("contactName", e.target.value)}
              />
            </FormField>
            <FormField label="Role at business">
              <Select
                required
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
              >
                <option value="">Select your role</option>
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            </FormField>
          </FormCard>

          <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Contact information
          </div>
          <FormCard>
            <FormField label="Business email">
              <TextInput
                type="email"
                required
                autoComplete="email"
                placeholder="orders@yourrestaurant.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </FormField>
            <FormField label="WhatsApp / phone number">
              <TextInput
                type="tel"
                required
                autoComplete="tel"
                placeholder="+1 (780) 000-0000"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </FormField>
          </FormCard>

          <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
            Create a password
          </div>
          <FormCard>
            <FormField label="Password">
              <PasswordInput
                required
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </FormField>
            <FormField label="Confirm password">
              <PasswordInput
                required
                autoComplete="new-password"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
              />
            </FormField>
          </FormCard>
          <PasswordStrength value={form.password} />

          <label className="mb-3.5 flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              required
              checked={form.agreeTerms}
              onChange={(e) => update("agreeTerms", e.target.checked)}
              className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-primary-500"
            />
            <span className="text-[0.8rem] leading-relaxed text-neutral-700">
              I agree to the{" "}
              <a href="#" className="font-bold text-primary-500">
                Wholesale Terms &amp; Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="font-bold text-primary-500">
                Privacy Policy
              </a>
              . I understand all wholesale orders are binding once placed.
            </span>
          </label>

          {error && (
            <p className="mb-3 text-[0.82rem] font-semibold text-red-600">{error}</p>
          )}

          <Button type="submit" disabled={isMutating}>
            {isMutating ? "Submitting…" : "Submit application →"}
          </Button>
          <button
            type="button"
            onClick={() => setStep(0)}
            className="mt-3 block w-full text-center text-[0.84rem] font-bold text-primary-500"
          >
            ← Back to business info
          </button>
        </form>
      )}
    </AuthShell>
  );
}
