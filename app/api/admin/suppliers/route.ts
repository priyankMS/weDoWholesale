import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { adminSupplierSchema } from "@/lib/validation/adminSuppliers";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json();
  const parsed = adminSupplierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supplier = await WdhSupplier.create(parsed.data);
  return NextResponse.json({ supplier }, { status: 201 });
}
