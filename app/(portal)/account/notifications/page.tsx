import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getNotificationPreferences } from "@/lib/db/queries/account";
import { AccountHeader } from "@/components/portal/AccountHeader";
import { NotificationPreferencesForm } from "@/components/portal/NotificationPreferencesForm";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const prefs = await getNotificationPreferences(session.userId);

  return (
    <div className="pb-8">
      <AccountHeader title="Notifications" subtitle="Choose how we keep you updated" />
      <NotificationPreferencesForm
        initial={{
          waOrderConfirmed: prefs.waOrderConfirmed,
          waOrderDispatched: prefs.waOrderDispatched,
          waSubstitutionAlerts: prefs.waSubstitutionAlerts,
          waLowStock: prefs.waLowStock,
          emailOrderConfirmation: prefs.emailOrderConfirmation,
          emailInvoice: prefs.emailInvoice,
          emailMonthlyStatement: prefs.emailMonthlyStatement,
          emailPaymentDueReminders: prefs.emailPaymentDueReminders,
          promoNewProducts: prefs.promoNewProducts,
          promoEidSeasonal: prefs.promoEidSeasonal,
          promoPriceChanges: prefs.promoPriceChanges,
        }}
      />
    </div>
  );
}
