import { z } from "zod";

// Screen 29's "New message" topic <select> options — kept here (client-safe,
// no Sequelize import) so both the API route's Zod schema and the compose
// form's <select> share one source of truth.
export const NEW_THREAD_TOPICS = [
  "general",
  "order_issue",
  "invoice",
  "product_availability",
  "delivery_scheduling",
  "account_terms",
] as const;
export type NewThreadTopic = (typeof NEW_THREAD_TOPICS)[number];

export const NEW_THREAD_TOPIC_LABELS: Record<NewThreadTopic, string> = {
  general: "General question",
  order_issue: "Order issue",
  invoice: "Invoice or billing",
  product_availability: "Product availability",
  delivery_scheduling: "Delivery scheduling",
  account_terms: "Account or terms",
};

// Screen 29's "New message" compose screen — topic select, optional order
// number, message body.
export const newThreadSchema = z.object({
  topic: z.enum(NEW_THREAD_TOPICS),
  orderNumber: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => (v ? v : undefined)),
  body: z.string().trim().min(1, "Write a message before sending").max(4000, "Message is too long"),
});
export type NewThreadInput = z.infer<typeof newThreadSchema>;

// A reply within an existing thread's chat view.
export const replyMessageSchema = z.object({
  body: z.string().trim().min(1, "Write a message before sending").max(4000, "Message is too long"),
});
export type ReplyMessageInput = z.infer<typeof replyMessageSchema>;
