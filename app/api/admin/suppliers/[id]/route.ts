import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { WdhSupplier } from "@/lib/db/models/WdhSupplier";
import { adminSupplierSchema } from "@/lib/validation/adminSuppliers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const supplier = await WdhSupplier.findByPk(Number(id));
  if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

  const body = await request.json();
  const parsed = adminSupplierSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await supplier.update(parsed.data);
  return NextResponse.json({ supplier });
}
