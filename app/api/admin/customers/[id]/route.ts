import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { User } from "@/lib/db/models/User";
import { adminCustomerStatusUpdateSchema } from "@/lib/validation/adminCustomers";
import { welcomeEmail } from "@/lib/email/templates/welcome";
import { sendEmail } from "@/lib/email/send";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const user = await User.findByPk(Number(id));
  if (!user) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const body = await request.json();
  const parsed = adminCustomerStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const wasApproved = user.status === "approved";
  await user.update({ status: parsed.data.status });

  // Fire the welcome email on the transition into "approved" only — not on
  // every PATCH that happens to already be approved (e.g. no-op re-saves).
  if (!wasApproved && parsed.data.status === "approved" && user.contactName && user.businessName && user.businessType) {
    const email = welcomeEmail({
      contactName: user.contactName,
      businessName: user.businessName,
      businessType: user.businessType,
      accountId: user.id,
      deliveryArea: user.city ?? undefined,
    });
    await sendEmail({ to: user.email, subject: email.subject, html: email.html, text: email.text });
  }

  return NextResponse.json({ user });
}
