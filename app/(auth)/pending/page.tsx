import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { User } from "@/lib/db/models/User";
import { AuthShell } from "@/components/auth/AuthShell";
import { Timeline } from "@/components/ui/Timeline";
import { BUSINESS_TYPES } from "@/components/ui/BusinessTypeGrid";
import { BrowseButton } from "@/components/auth/BrowseButton";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function PendingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await User.findByPk(session.userId);
  if (!user) redirect("/login");
  if (user.status === "approved") redirect("/catalogue");

  const businessIcon =
    BUSINESS_TYPES.find((b) => b.value === user.businessType)?.icon ?? "🏢";

  return (
    <AuthShell showSignInPrompt={false}>
      <div className="mb-3.5 flex items-center gap-3.5 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-5">
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
      </div>

      <div className="mb-3.5 flex items-start gap-3.5 rounded-2xl bg-primary-500 p-4.5 text-white">
        <div className="shrink-0 text-2xl">⏳</div>
        <div>
          <div className="mb-1 font-serif text-[1.1rem] font-black">
            Account under review
          </div>
          <div className="text-[0.82rem] leading-relaxed opacity-90">
            Your application is being reviewed by our team. You&apos;ll
            receive a WhatsApp message and email as soon as you&apos;re
            approved — usually within 24 hours.
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-start gap-2.5 rounded-xl border-[1.5px] border-amber-300 bg-amber-50 p-3.5">
        <div className="shrink-0 text-lg">👀</div>
        <div className="text-[0.8rem] leading-relaxed font-semibold text-amber-800">
          While you wait, you can browse our product catalogue. Ordering is
          unlocked once your account is approved.
        </div>
      </div>

      <div className="mb-2 text-[0.66rem] font-extrabold tracking-widest text-neutral-400 uppercase">
        Your application status
      </div>
      <Timeline
        items={[
          {
            status: "done",
            icon: "✓",
            title: "Application submitted",
            desc: "Today — business info and contact details received.",
          },
          {
            status: "active",
            icon: "⏳",
            title: "Under review",
            desc: "Our team is verifying your business type and location. Typically done within a few hours.",
          },
          {
            status: "pending",
            icon: "",
            title: "Approval and full access",
            desc: "You'll be notified by email and WhatsApp once approved.",
          },
        ]}
      />

      <div className="mb-4.5 grid grid-cols-2 gap-2">
        <div className="rounded-[10px] border-[1.5px] border-neutral-200 bg-white p-3.5 text-center">
          <div className="mb-1 text-xl">📦</div>
          <div className="mb-0.5 text-[0.82rem] font-extrabold text-neutral-900">
            100 kg+
          </div>
          <div className="text-[0.65rem] text-neutral-400">Minimum order</div>
        </div>
        <div className="rounded-[10px] border-[1.5px] border-neutral-200 bg-white p-3.5 text-center">
          <div className="mb-1 text-xl">🚚</div>
          <div className="mb-0.5 text-[0.82rem] font-extrabold text-neutral-900">
            {user.city}
          </div>
          <div className="text-[0.65rem] text-neutral-400">
            Current delivery area
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <BrowseButton />
        <a
          href="https://wa.me/17807227623?text=Hi%20WeDoHalal%2C%20I%27d%20like%20to%20check%20on%20my%20wholesale%20application."
          target="_blank"
          rel="noopener noreferrer"
        >
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-4 text-[0.92rem] font-extrabold text-white transition-colors hover:bg-[#1aad55]"
          >
            💬 Check on my application
          </button>
        </a>
        <SignOutButton />
      </div>
    </AuthShell>
  );
}
