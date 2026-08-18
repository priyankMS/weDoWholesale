import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { User } from "@/lib/db/models/User";
import { CheckoutClient } from "@/components/portal/CheckoutClient";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await User.findByPk(session.userId);
  if (!user) redirect("/login");

  // Same rule the Phase 1 pending-review screen states ("ordering is
  // unlocked once your account is approved") — enforced again server-side
  // in createOrder(), this is just the friendlier front door so a pending
  // account doesn't fill out the whole wizard before hitting that error.
  if (user.status !== "approved") {
    return (
      <div className="mx-4 mt-6 mb-8 max-w-md rounded-2xl border-[1.5px] border-neutral-200 bg-white p-6 text-center lg:mx-auto">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-2xl">
          ⏳
        </div>
        <div className="mb-1.5 font-serif text-[1.15rem] font-black text-neutral-900">
          Account under review
        </div>
        <div className="mb-5 text-[0.86rem] leading-relaxed text-neutral-500">
          Your wholesale application is still being reviewed. You can keep browsing and
          building your cart — ordering unlocks as soon as your account is approved.
        </div>
        <Link
          href="/cart"
          className="inline-block rounded-full bg-primary-500 px-5 py-2.5 text-[0.86rem] font-bold text-white hover:bg-primary-600"
        >
          ← Back to cart
        </Link>
      </div>
    );
  }

  return (
    <CheckoutClient
      account={{
        businessName: user.businessName,
        city: user.city,
        businessAddress: user.businessAddress,
        phone: user.phone,
      }}
    />
  );
}
