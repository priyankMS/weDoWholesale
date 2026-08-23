"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAdminOrderStatus } from "@/lib/api/adminOrders";
import { getApiErrorMessage } from "@/lib/api/error";
import type { OrderStatus } from "@/lib/db/models/Order";

const STATUSES: OrderStatus[] = ["pending", "new", "shipped", "delivered", "cancelled", "returned"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-neutral-100 text-neutral-600",
  new: "bg-blue-100 text-blue-700",
  shipped: "bg-amber-100 text-amber-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-purple-100 text-purple-700",
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
      className={`cursor-pointer rounded-full border-none px-2.5 py-1 text-[0.8rem] font-bold outline-none disabled:opacity-60 ${STATUS_STYLES[current]}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}
