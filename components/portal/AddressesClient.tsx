"use client";

import { useState } from "react";
import { useToast } from "@/components/portal/ToastProvider";
import { FormCard, FormField, TextInput, Select } from "@/components/ui/FormCard";
import { Button } from "@/components/ui/Button";
import {
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "@/lib/api/account";
import { getApiErrorMessage } from "@/lib/api/error";

export type AddressRow = {
  id: number;
  label: string | null;
  name: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  mobile: string | null;
  isDefault: boolean;
};

const CITIES = [
  "Edmonton",
  "Calgary",
  "Sherwood Park",
  "St. Albert",
  "Spruce Grove",
  "Fort Saskatchewan",
  "Leduc",
];

const BLANK_FORM = {
  label: "",
  business: "",
  street: "",
  city: CITIES[0],
  postalCode: "",
  phone: "",
};

export function AddressesClient({ initialAddresses }: { initialAddresses: AddressRow[] }) {
  const showToast = useToast();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditingId(null);
    setForm(BLANK_FORM);
    setModalOpen(true);
  }

  function openEdit(addr: AddressRow) {
    setEditingId(addr.id);
    setForm({
      label: addr.label ?? "",
      business: addr.name ?? "",
      street: addr.address ?? "",
      city: addr.city ?? CITIES[0],
      postalCode: addr.zipCode ?? "",
      phone: addr.mobile ?? "",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId != null) {
        const { address } = await updateAddress(editingId, form);
        setAddresses((prev) => prev.map((a) => (a.id === editingId ? address : a)));
      } else {
        const { address } = await createAddress(form);
        setAddresses((prev) => [...prev, address]);
      }
      showToast("Address saved ✓");
      setModalOpen(false);
    } catch (err) {
      showToast(getApiErrorMessage(err, "Couldn't save this address"));
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(addr: AddressRow) {
    if (addr.isDefault) {
      showToast("Already the default address");
      return;
    }
    try {
      await setDefaultAddress(addr.id);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === addr.id })));
      showToast("Set as default address ✓");
    } catch (err) {
      showToast(getApiErrorMessage(err));
    }
  }

  async function handleDelete(addr: AddressRow) {
    if (addr.isDefault) {
      showToast("Set another address as default before deleting this one");
      return;
    }
    try {
      await deleteAddress(addr.id);
      setAddresses((prev) => prev.filter((a) => a.id !== addr.id));
      showToast("Address deleted");
    } catch (err) {
      showToast(getApiErrorMessage(err));
    }
  }

  return (
    <>
      <div className="mt-3.5 lg:grid lg:grid-cols-2 lg:gap-3.5">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`mx-4 mb-2.5 rounded-2xl border-[1.5px] bg-white p-4 lg:mx-0 ${
              addr.isDefault ? "border-primary-500" : "border-neutral-200"
            }`}
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="mb-0.5 text-[0.92rem] font-extrabold text-neutral-900">
                  {addr.name ?? "Delivery address"}
                  {addr.label ? ` — ${addr.label}` : ""}
                </div>
              </div>
              {addr.isDefault && (
                <span className="shrink-0 rounded-full border border-primary-200 bg-primary-50 px-2.25 py-0.75 text-[0.66rem] font-extrabold text-primary-600">
                  Default
                </span>
              )}
            </div>
            <div className="mb-2.5 text-[0.82rem] leading-relaxed text-neutral-700">
              {addr.address}
              <br />
              {addr.city} {addr.zipCode}
              <br />
              {addr.mobile && `📱 ${addr.mobile}`}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(addr)}
                className="flex-1 rounded-[9px] border-[1.5px] border-neutral-200 bg-white py-2 text-[0.78rem] font-bold text-neutral-700 hover:bg-neutral-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleSetDefault(addr)}
                className="flex-1 rounded-[9px] border-[1.5px] border-neutral-200 bg-white py-2 text-[0.78rem] font-bold text-neutral-700 hover:bg-neutral-50"
              >
                Set default
              </button>
              <button
                type="button"
                onClick={() => handleDelete(addr)}
                className="flex-1 rounded-[9px] border-[1.5px] border-red-200 bg-white py-2 text-[0.78rem] font-bold text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pt-1 pb-2 lg:px-0">
        <button
          type="button"
          onClick={openAdd}
          className="w-full rounded-xl border-[1.5px] border-neutral-200 bg-white py-3.25 text-center text-[0.9rem] font-bold text-neutral-700 hover:bg-neutral-50"
        >
          + Add delivery address
        </button>
      </div>

      {/* Add/edit modal — same bottom-sheet/centered-modal pattern as FilterDrawer.tsx */}
      <div
        onClick={() => !saving && setModalOpen(false)}
        className={`fixed inset-0 z-100 bg-neutral-900/45 transition-opacity ${
          modalOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-101 max-h-[88vh] overflow-y-auto rounded-t-[20px] bg-white transition-transform duration-300 lg:inset-x-auto lg:top-1/2 lg:right-auto lg:left-1/2 lg:max-h-[85vh] lg:w-110 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl ${
          modalOpen ? "translate-y-0" : "translate-y-full lg:scale-95 lg:opacity-0"
        }`}
      >
        <div className="mx-auto mt-3 mb-1 h-1 w-9.5 rounded-full bg-neutral-200 lg:hidden" />
        <div className="flex items-center justify-between border-b border-neutral-200 px-4.5 py-3.5">
          <div className="font-serif text-[1.1rem] font-bold text-neutral-900">
            {editingId != null ? "Edit delivery address" : "Add delivery address"}
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="text-[1.1rem] text-neutral-400"
          >
            ✕
          </button>
        </div>

        <div className="px-4.5 pt-3.5 pb-5">
          <FormCard>
            <FormField label="Label">
              <TextInput
                placeholder="e.g. Main kitchen, Branch 2"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </FormField>
            <FormField label="Business">
              <TextInput
                placeholder="Business name at this location"
                value={form.business}
                onChange={(e) => setForm({ ...form, business: e.target.value })}
              />
            </FormField>
            <FormField label="Street">
              <TextInput
                placeholder="Street address"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
              />
            </FormField>
            <FormField label="City">
              <Select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Postal code">
              <TextInput
                placeholder="T5A 0A1"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              />
            </FormField>
            <FormField label="Phone">
              <TextInput
                type="tel"
                placeholder="+1 (780) 000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </FormField>
          </FormCard>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save address"}
          </Button>
        </div>
      </div>
    </>
  );
}
