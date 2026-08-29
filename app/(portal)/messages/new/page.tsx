import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { NewThreadForm } from "@/components/portal/NewThreadForm";
import { NEW_THREAD_TOPICS, type NewThreadTopic } from "@/lib/validation/messages";

// Screen 29 — "New message" compose screen. Accepts ?order= and ?topic=
// so links elsewhere in the app (e.g. the order detail page's "Question"
// button) land here pre-filled instead of a blank form.
export default async function NewThreadPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; topic?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { order, topic } = await searchParams;
  const initialTopic = NEW_THREAD_TOPICS.includes(topic as NewThreadTopic)
    ? (topic as NewThreadTopic)
    : undefined;

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
      <NewThreadForm initialOrderNumber={order} initialTopic={initialTopic} />
    </div>
  );
}
