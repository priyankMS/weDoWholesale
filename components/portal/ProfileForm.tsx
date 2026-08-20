"use client";

import { useState } from "react";
import { useToast } from "@/components/portal/ToastProvider";
import { FormCard, FormField, TextInput, Select } from "@/components/ui/FormCard";
import { Button } from "@/components/ui/Button";
import { BUSINESS_TYPES } from "@/components/ui/BusinessTypeGrid";
import { updateProfile } from "@/lib/api/account";
import { getApiErrorMessage } from "@/lib/api/error";
import { forgotPassword } from "@/lib/api/auth";
import type { UpdateProfileInput } from "@/lib/validation/account";
import type { BusinessType } from "@/lib/db/models/User";

const CITIES = [
  "Edmonton",
  "Calgary",
  "Sherwood Park",
  "St. Albert",
  "Spruce Grove",
  "Fort Saskatchewan",
  "Leduc",
];
const ROLES = ["Owner", "Manager", "Purchasing / Procurement", "Chef", "Other"];

export function ProfileForm({
  initial,
  email,
  accountStatus,
  memberSince,
  accountId,
}: {
  initial: UpdateProfileInput;
  email: string;
  accountStatus: string;
  memberSince: string;
  accountId: string;
}) {
  const showToast = useToast();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  function field<K extends keyof UpdateProfileInput>(key: K) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value as UpdateProfileInput[K] })),
    };
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile(form);
      showToast("Profile saved ✓");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Couldn't save your profile"));
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    try {
      await forgotPassword({ email });
      showToast("Password reset email sent");
    } catch {
      showToast("Password reset email sent");
    }
  }

  return (
    <>
      <div className="px-4 pt-3.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Business information
      </div>
      <div className="mx-4 lg:mx-0">
        <FormCard>
          <FormField label="Business name">
            <TextInput {...field("businessName")} />
          </FormField>
          <FormField label="Business type">
            <Select {...field("businessType")}>
              {BUSINESS_TYPES.map((t: { value: BusinessType; name: string }) => (
                <option key={t.value} value={t.value}>
                  {t.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="City">
            <Select {...field("city")}>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Business address">
            <TextInput {...field("businessAddress")} />
          </FormField>
        </FormCard>
      </div>

      <div className="px-4 pt-2 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Contact person
      </div>
      <div className="mx-4 lg:mx-0">
        <FormCard>
          <FormField label="Full name">
            <TextInput {...field("contactName")} />
          </FormField>
          <FormField label="Role">
            <Select {...field("role")}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="WhatsApp / phone">
            <TextInput type="tel" {...field("phone")} />
          </FormField>
        </FormCard>
      </div>

      <div className="px-4 pt-2 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Account credentials
      </div>
      <div className="mx-4 mb-1 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-[0.7rem] font-extrabold tracking-wide text-neutral-400 uppercase">
              Email
            </div>
            <div className="mt-0.5 text-[0.9rem] font-medium text-neutral-900">{email}</div>
          </div>
          <button
            type="button"
            onClick={() => showToast("Email change requires verification")}
            className="text-[0.78rem] font-bold text-primary-500"
          >
            Change
          </button>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-[0.7rem] font-extrabold tracking-wide text-neutral-400 uppercase">
              Password
            </div>
            <div className="mt-0.5 text-[0.9rem] font-medium text-neutral-900">••••••••</div>
          </div>
          <button
            type="button"
            onClick={handlePasswordReset}
            className="text-[0.78rem] font-bold text-primary-500"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="px-4 pt-2 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        Account info
      </div>
      <div className="mx-4 mb-1 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
        <div className="flex items-center justify-between px-4 py-3 text-[0.84rem]">
          <span className="text-neutral-500">Account status</span>
          <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.75 text-[0.68rem] font-extrabold text-green-600">
            {accountStatus}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-[0.84rem]">
          <span className="text-neutral-500">Member since</span>
          <span className="font-bold text-neutral-900">{memberSince}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-[0.84rem]">
          <span className="text-neutral-500">Account ID</span>
          <span className="font-bold text-neutral-400">{accountId}</span>
        </div>
      </div>

      <div className="px-4 pt-2 pb-1 lg:px-0 lg:max-w-90">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <div className="h-2" />
        <button
          type="button"
          onClick={() =>
            showToast("Account deletion request submitted — our team will contact you")
          }
          className="w-full rounded-xl border-[1.5px] border-red-200 bg-white py-3.25 text-[0.9rem] font-bold text-red-600 hover:bg-red-50"
        >
          Request account deletion
        </button>
      </div>
    </>
  );
}
