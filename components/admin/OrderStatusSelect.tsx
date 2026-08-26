"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAdminOrderStatus } from "@/lib/api/adminOrders";
import { getApiErrorMessage } from "@/lib/api/error";
import type { OrderStatus } from "@/lib/db/models/Order";

const STATUSES: OrderStatus[] = ["pending", "new", "shipped", "delivered", "cancelled", "returned"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-[#f0ede9] text-[#8a8480]",
  new: "bg-[#e8eef8] text-[#1a6fcc]",
  shipped: "bg-[#fff8e0] text-[#c48a00]",
  delivered: "bg-[#e8f7ef] text-[#1e8a4a]",
  cancelled: "bg-[#fde8e8] text-[#cc2222]",
  returned: "bg-[#fdf2f1] text-[#e05a4a]",
};

export function OrderStatusSelect({ orderId, status }: { orderId: number; status: OrderStatus | null }) {
  const router = useRouter();
  const [current, setCurrent] = useState<OrderStatus>(status ?? "pending");
  const [saving, setSaving] = useState(false);

  async function handleChange(next: OrderStatus) {
    const prev = current;
    setCurrent(next);
    setSaving(true);
    try {
      await updateAdminOrderStatus(orderId, next);
      toast.success("Order status updated");
      router.refresh();
    } catch (err) {
      setCurrent(prev);
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={current}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      className={`cursor-pointer rounded-[3px] border-none px-2 py-1 text-[13px] font-bold outline-none disabled:opacity-60 ${STATUS_STYLES[current]}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}
