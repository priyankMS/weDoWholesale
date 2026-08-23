import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { User } from "@/lib/db/models/User";
import { getPlatformSettings } from "@/lib/db/queries/settings";
import { CheckoutClient } from "@/components/portal/CheckoutClient";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await User.findByPk(session.userId);
  if (!user) redirect("/login");
  // Ordering unlocks once an admin approves the account — see
  // createOrder() (lib/db/queries/orders.ts) for the matching server-side
  // gate on the actual order-creation call.
  if (user.status !== "approved") redirect("/pending");

  const settings = await getPlatformSettings();

  return (
    <CheckoutClient
      account={{
        businessName: user.businessName,
        city: user.city,
        businessAddress: user.businessAddress,
        phone: user.phone,
        paymentTerms: user.paymentTerms,
      }}
      gstRatePercent={settings.gstRatePercent}
    />
  );
}
