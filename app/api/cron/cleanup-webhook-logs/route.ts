import { NextResponse } from "next/server";
import { deleteOldStripeWebhookLogs } from "@/lib/db/queries/stripeWebhookLogs";

// Triggered by a server cron job (CloudPanel "Cron Jobs" tab → curl this
// route daily), not QStash — this project has no other scheduled (as
// opposed to queued) jobs, and a plain host-level cron + shared secret is
// simpler than provisioning a QStash schedule for one daily delete.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  }

  const provided = request.headers.get("x-cron-secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await deleteOldStripeWebhookLogs();
  return NextResponse.json({ deleted });
}
