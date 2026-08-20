import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { NewThreadForm } from "@/components/portal/NewThreadForm";

// Screen 29 — "New message" compose screen.
export default async function NewThreadPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div>
      <div className="border-b-[1.5px] border-neutral-200 bg-white px-4.5 py-3.5 lg:px-6 lg:py-5">
        <div className="flex items-center justify-between lg:hidden">
          <Link href="/messages" className="text-[0.86rem] font-bold text-primary-500">
            ← Inbox
          </Link>
        </div>
        <div className="mt-1.5 font-serif text-[1.2rem] font-bold text-neutral-900 lg:mt-0 lg:text-[1.4rem] lg:font-black">
          New message
        </div>
      </div>
      <NewThreadForm />
    </div>
  );
}
