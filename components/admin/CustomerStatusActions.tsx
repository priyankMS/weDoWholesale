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
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setStatus("rejected")}
          disabled={loading !== null}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-[0.84rem] font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
        >
          {loading === "rejected" ? "…" : "Reject"}
        </button>
        <button
          type="button"
          onClick={() => setStatus("approved")}
          disabled={loading !== null}
          className="rounded-md bg-green-600 px-3 py-1.5 text-[0.84rem] font-bold text-white hover:bg-green-700 disabled:opacity-50"
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
          className="rounded-md bg-green-600 px-3 py-1.5 text-[0.84rem] font-bold text-white hover:bg-green-700 disabled:opacity-50"
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
        className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-[0.84rem] font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
      >
        {loading === "rejected" ? "…" : "Revoke"}
      </button>
    </div>
  );
}
