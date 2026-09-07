"use client";

import { useState } from "react";
import { toast } from "sonner";
import { emailAdminOrderInvoice } from "@/lib/api/adminOrders";
import { getApiErrorMessage } from "@/lib/api/error";

export function EmailInvoiceButton({ orderId }: { orderId: number }) {
  const [sending, setSending] = useState(false);

  async function handleClick() {
    setSending(true);
    try {
      await emailAdminOrderInvoice(orderId);
      toast.success("Invoice emailed to the customer");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={sending}
      className="rounded-[5px] border border-[#d0ccc6] px-2.5 py-1.5 text-[13px] font-bold text-[#5a5450] hover:bg-[#f5f3f0] disabled:opacity-60"
    >
      {sending ? "Sending…" : "Email invoice"}
    </button>
  );
}
