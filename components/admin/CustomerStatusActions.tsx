"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAdminCustomerStatus } from "@/lib/api/adminCustomers";
import { getApiErrorMessage } from "@/lib/api/error";
import type { AccountStatus } from "@/lib/db/models/User";

export function CustomerStatusActions({
  customerId,
  businessName,
  status,
}: {
  customerId: number;
  businessName: string | null;
  status: AccountStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<AccountStatus | null>(null);

  async function setStatus(next: AccountStatus) {
    setLoading(next);
    try {
      await updateAdminCustomerStatus(customerId, { status: next });
      toast.success(
        next === "approved"
          ? `${businessName ?? "Account"} approved — welcome email sent`
          : next === "rejected"
            ? `${businessName ?? "Account"} rejected`
            : "Status updated",
      );
      router.refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(null);
    }
  }

  if (status === "pending_review") {
    return (
      <div className="flex justify-end gap-1.5">
        <button
          type="button"
          onClick={() => setStatus("rejected")}
          disabled={loading !== null}
          className="rounded-[5px] border border-[#d0ccc6] bg-white px-2.5 py-1 text-[13px] font-bold text-[#5a5450] hover:bg-[#f0ede9] disabled:opacity-50"
        >
          {loading === "rejected" ? "…" : "Reject"}
        </button>
        <button
          type="button"
          onClick={() => setStatus("approved")}
          disabled={loading !== null}
          className="rounded-[5px] bg-[#1e8a4a] px-2.5 py-1 text-[13px] font-bold text-white hover:bg-[#186b3a] disabled:opacity-50"
        >
          {loading === "approved" ? "…" : "✓ Approve"}
        </button>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setStatus("approved")}
          disabled={loading !== null}
          className="rounded-[5px] bg-[#1e8a4a] px-2.5 py-1 text-[13px] font-bold text-white hover:bg-[#186b3a] disabled:opacity-50"
        >
          {loading === "approved" ? "…" : "✓ Approve instead"}
        </button>
      </div>
    );
  }

  // Approved — offer a way to revoke, mirroring reject above.
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => setStatus("rejected")}
        disabled={loading !== null}
        className="rounded-[5px] border border-[#d0ccc6] bg-white px-2.5 py-1 text-[13px] font-bold text-[#5a5450] hover:bg-[#f0ede9] disabled:opacity-50"
      >
        {loading === "rejected" ? "…" : "Revoke"}
      </button>
    </div>
  );
}
