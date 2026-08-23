import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { listAdminCustomers } from "@/lib/db/queries/adminCustomers";
import { toCsvResponse } from "@/lib/csv/toCsvResponse";
import type { AccountStatus } from "@/lib/db/models/User";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") as AccountStatus | "all" | null) ?? "all";
  const search = searchParams.get("q") ?? undefined;

  const { customers } = await listAdminCustomers({ status, search, pageSize: 100_000 });

  const header = [
    "Business Name",
    "Contact Name",
    "Email",
    "Phone",
    "City",
    "Business Type",
    "Est. Monthly Volume",
    "Status",
    "Applied At",
  ];
  const rows = customers.map((c) => [
    c.businessName ?? "",
    c.contactName ?? "",
    c.email,
    c.phone ?? "",
    c.city ?? "",
    c.businessType ?? "",
    c.monthlyVolume ?? "",
    c.status,
    new Date(c.createdAt).toISOString(),
  ]);

  return toCsvResponse("customers", header, rows);
}
