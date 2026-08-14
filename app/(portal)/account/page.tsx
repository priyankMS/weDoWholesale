import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { User } from "@/lib/db/models/User";
import { BUSINESS_TYPES } from "@/components/ui/BusinessTypeGrid";
import { SignOutButton } from "@/components/auth/SignOutButton";

// A minimal, real account page — the mockup's bottom nav pointed this tab
// at a "built in Phase 4" toast, but that's not something to ship to
// production; this shows the signed-in wholesale account's real profile
// data (from the same `users` row every other screen in this phase reads
// from) plus sign-out, and leaves richer account management (order
// history, saved payment terms, etc.) to Phase 4 as originally planned.
export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await User.findByPk(session.userId);
  if (!user) redirect("/login");

  const businessIcon = BUSINESS_TYPES.find((b) => b.value === user.businessType)?.icon ?? "🏢";
  const businessLabel =
    BUSINESS_TYPES.find((b) => b.value === user.businessType)?.name ?? "Business";

  const rows: [string, string | null][] = [
    ["Business name", user.businessName],
    ["Business type", businessLabel],
    ["Contact name", user.contactName],
    ["Role", user.role],
    ["Email", user.email],
    ["Phone", user.phone],
    ["City", user.city],
    ["Business address", user.businessAddress],
  ];

  return (
    <div className="pb-8">
      <div className="mx-4 mt-3.5 mb-3.5 flex items-center gap-3.5 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-5 lg:mx-0 lg:mt-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary-200 bg-primary-50 text-2xl">
          {businessIcon}
        </div>
        <div>
          <div className="mb-0.5 text-[0.68rem] font-extrabold tracking-wide text-neutral-400 uppercase">
            Logged in as
          </div>
          <div className="text-[0.95rem] font-extrabold text-neutral-900">
            {user.businessName}
          </div>
          <div className="text-[0.76rem] text-neutral-700">{user.email}</div>
        </div>
        <span className="ml-auto shrink-0 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[0.66rem] font-extrabold text-green-600">
          ✓ Approved
        </span>
      </div>

      <div className="mx-4 mb-4 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
        {rows
          .filter(([, val]) => val)
          .map(([label, val]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 text-[0.86rem] last:border-none"
            >
              <span className="font-medium text-neutral-700">{label}</span>
              <span className="text-right font-bold text-neutral-900">{val}</span>
            </div>
          ))}
      </div>

      <div className="mx-4 lg:mx-0 lg:max-w-70">
        <SignOutButton />
      </div>
    </div>
  );
}
