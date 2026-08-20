import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { User } from "@/lib/db/models/User";
import { AccountHeader } from "@/components/portal/AccountHeader";
import { ProfileForm } from "@/components/portal/ProfileForm";

const STATUS_LABEL: Record<string, string> = {
  approved: "Approved",
  pending_review: "Pending review",
  rejected: "Rejected",
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await User.findByPk(session.userId);
  if (!user) redirect("/login");

  return (
    <div className="pb-8">
      <AccountHeader title="Business profile" subtitle="Edit business info and contact" />
      <ProfileForm
        email={user.email}
        accountStatus={STATUS_LABEL[user.status] ?? user.status}
        memberSince={user.createdAt.toLocaleDateString("en-CA", {
          month: "long",
          year: "numeric",
        })}
        accountId={`WDH-ACC-${String(user.id).padStart(5, "0")}`}
        initial={{
          businessType: user.businessType ?? "restaurant",
          businessName: user.businessName ?? "",
          city: user.city ?? "Edmonton",
          businessAddress: user.businessAddress ?? "",
          contactName: user.contactName ?? "",
          role: user.role ?? "Owner",
          phone: user.phone ?? "",
        }}
      />
    </div>
  );
}
