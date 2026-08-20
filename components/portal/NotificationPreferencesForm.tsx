"use client";

import { useState } from "react";
import { useToast } from "@/components/portal/ToastProvider";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { Button } from "@/components/ui/Button";
import { updateNotificationPreferences } from "@/lib/api/account";
import { getApiErrorMessage } from "@/lib/api/error";
import type { NotificationPreferencesInput } from "@/lib/validation/account";

type ToggleDef = {
  key: keyof NotificationPreferencesInput;
  label: string;
  sub: string;
};

const WHATSAPP_TOGGLES: ToggleDef[] = [
  {
    key: "waOrderConfirmed",
    label: "Order confirmed",
    sub: "Message when we receive and confirm your order",
  },
  {
    key: "waOrderDispatched",
    label: "Order dispatched",
    sub: "Driver name and ETA sent when order leaves our facility",
  },
  {
    key: "waSubstitutionAlerts",
    label: "Substitution alerts",
    sub: "Notified immediately if any item is substituted or unavailable",
  },
  {
    key: "waLowStock",
    label: "Low stock on my items",
    sub: "Alert when products you regularly order are running low",
  },
];

const EMAIL_TOGGLES: ToggleDef[] = [
  {
    key: "emailOrderConfirmation",
    label: "Order confirmation email",
    sub: "Full order summary sent to your business email",
  },
  {
    key: "emailInvoice",
    label: "Invoice email",
    sub: "PDF invoice emailed after each delivery",
  },
  {
    key: "emailMonthlyStatement",
    label: "Monthly statement",
    sub: "Summary of all orders and spend for the month",
  },
  {
    key: "emailPaymentDueReminders",
    label: "Payment due reminders",
    sub: "Reminder 3 days before Net 15/30 invoice due date",
  },
];

const PROMO_TOGGLES: ToggleDef[] = [
  {
    key: "promoNewProducts",
    label: "New product announcements",
    sub: "When new cuts or suppliers are added to the catalogue",
  },
  {
    key: "promoEidSeasonal",
    label: "Eid and seasonal specials",
    sub: "Advance notice for Eid al-Adha whole animal orders and Ramadan specials",
  },
  {
    key: "promoPriceChanges",
    label: "Price change notices",
    sub: "When wholesale pricing is updated for your regular items",
  },
];

function Group({
  title,
  toggles,
  values,
  onChange,
}: {
  title: string;
  toggles: ToggleDef[];
  values: NotificationPreferencesInput;
  onChange: (key: keyof NotificationPreferencesInput, v: boolean) => void;
}) {
  return (
    <>
      <div className="px-4 pt-3.5 pb-1.5 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase lg:px-0">
        {title}
      </div>
      <div className="mx-4 mb-1 divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between gap-3.5 px-4 py-3.5">
            <div className="flex-1">
              <div className="mb-0.5 text-[0.88rem] font-bold text-neutral-900">{t.label}</div>
              <div className="text-[0.72rem] leading-relaxed text-neutral-400">{t.sub}</div>
            </div>
            <ToggleSwitch
              checked={values[t.key]}
              onChange={(v) => onChange(t.key, v)}
              label={t.label}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export function NotificationPreferencesForm({
  initial,
}: {
  initial: NotificationPreferencesInput;
}) {
  const showToast = useToast();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);

  function set(key: keyof NotificationPreferencesInput, v: boolean) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateNotificationPreferences(values);
      showToast("Preferences saved ✓");
    } catch (err) {
      showToast(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Group title="WhatsApp notifications" toggles={WHATSAPP_TOGGLES} values={values} onChange={set} />
      <Group title="Email notifications" toggles={EMAIL_TOGGLES} values={values} onChange={set} />
      <Group title="Promotional" toggles={PROMO_TOGGLES} values={values} onChange={set} />

      <div className="px-4 pt-1 lg:px-0">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </>
  );
}
