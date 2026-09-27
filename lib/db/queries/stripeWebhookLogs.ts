import { Op } from "sequelize";
import { StripeWebhookLog } from "@/lib/db/models/StripeWebhookLog";

const RETENTION_DAYS = 15;

type LogWebhookEventInput = {
  eventId: string;
  eventType: string;
  status: "processed" | "ignored" | "error";
  orderNumber?: string | null;
  errorMessage?: string | null;
  payload?: object | null;
};

// findOrCreate on the unique eventId — Stripe's at-least-once delivery
// means the same event can hit the webhook route more than once, and that
// must stay a no-op here too (matches the idempotency guard already used
// for order state in app/api/webhooks/stripe/route.ts).
export async function logStripeWebhookEvent(input: LogWebhookEventInput): Promise<void> {
  await StripeWebhookLog.findOrCreate({
    where: { eventId: input.eventId },
    defaults: {
      eventId: input.eventId,
      eventType: input.eventType,
      status: input.status,
      orderNumber: input.orderNumber ?? null,
      errorMessage: input.errorMessage ?? null,
      payload: input.payload ?? null,
    },
  });
}

// Called on a schedule (see app/api/cron/cleanup-webhook-logs/route.ts) —
// keeps the table from growing forever while leaving enough history to
// debug a recent payment issue.
export async function deleteOldStripeWebhookLogs(): Promise<number> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  return StripeWebhookLog.destroy({ where: { createdAt: { [Op.lt]: cutoff } } });
}
