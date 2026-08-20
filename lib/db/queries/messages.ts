import { cache } from "react";
import {
  MessageThread,
  type MessageThreadAvatarKind,
  type MessageThreadTagStyle,
  type MessageThreadTopic,
} from "@/lib/db/models/MessageThread";
import { Message, type MessageSenderType } from "@/lib/db/models/Message";
import { Op } from "sequelize";
import { NEW_THREAD_TOPIC_LABELS, type NewThreadInput } from "@/lib/validation/messages";

// How each topic maps onto a new thread's subject line and .thread-tag
// pill — labels themselves live in lib/validation/messages.ts (client-safe,
// shared with the compose form's <select>); this adds the server-only
// tagStyle + the "welcome" topic used only for the lazily-created welcome
// thread (never chosen by a user).
const TOPIC_TAG_STYLE: Record<MessageThreadTopic, MessageThreadTagStyle> = {
  general: "support",
  order_issue: "order",
  invoice: "support",
  product_availability: "support",
  delivery_scheduling: "order",
  account_terms: "support",
  welcome: "system",
};
const TOPIC_LABELS: Record<MessageThreadTopic, string> = {
  ...NEW_THREAD_TOPIC_LABELS,
  welcome: "Welcome",
};

const STAFF_AUTO_REPLY =
  "Got your message — we'll get back to you shortly. Usually within the hour during support hours (9 AM – 7 PM MST, Mon–Sat).";

export type ThreadListRow = {
  id: number;
  subject: string;
  orderNumber: string | null;
  avatarKind: MessageThreadAvatarKind;
  icon: string | null;
  tagLabel: string;
  tagStyle: MessageThreadTagStyle;
  lastMessageAt: Date;
  preview: string;
  previewBold: boolean;
  unreadCount: number;
};

export async function listThreads(userId: number): Promise<ThreadListRow[]> {
  await ensureWelcomeThread(userId);

  const threads = await MessageThread.findAll({
    where: { userId },
    order: [["lastMessageAt", "DESC"]],
  });

  const rows: ThreadListRow[] = [];
  for (const thread of threads) {
    const [lastMessage, unreadCount] = await Promise.all([
      Message.findOne({ where: { threadId: thread.id }, order: [["createdAt", "DESC"]] }),
      Message.count({
        where: { threadId: thread.id, senderType: { [Op.ne]: "customer" }, readAt: null },
      }),
    ]);

    rows.push({
      id: thread.id,
      subject: thread.subject,
      orderNumber: thread.orderNumber,
      avatarKind: thread.avatarKind,
      icon: thread.icon,
      tagLabel: thread.tagLabel,
      tagStyle: thread.tagStyle,
      lastMessageAt: thread.lastMessageAt,
      preview: lastMessage?.body ?? "",
      previewBold: unreadCount > 0,
      unreadCount,
    });
  }

  return rows;
}

export async function unreadThreadCount(userId: number): Promise<number> {
  const threads = await MessageThread.findAll({ where: { userId }, attributes: ["id"] });
  if (threads.length === 0) return 0;
  const unreadMessages = await Message.findAll({
    where: {
      threadId: threads.map((t) => t.id),
      senderType: { [Op.ne]: "customer" },
      readAt: null,
    },
    attributes: ["threadId"],
  });
  return new Set(unreadMessages.map((m) => m.threadId)).size;
}

export type ThreadMessageRow = {
  id: number;
  senderType: MessageSenderType;
  senderName: string | null;
  body: string;
  createdAt: Date;
};

export type ThreadDetail = {
  id: number;
  subject: string;
  topic: MessageThreadTopic;
  orderNumber: string | null;
  avatarKind: MessageThreadAvatarKind;
  icon: string | null;
  tagLabel: string;
  tagStyle: MessageThreadTagStyle;
  messages: ThreadMessageRow[];
};

// Loads a thread's full message history and marks every unread staff/system
// message as read — mirrors opening a real inbox thread.
export async function getThread(userId: number, threadId: number): Promise<ThreadDetail | null> {
  const thread = await MessageThread.findOne({ where: { id: threadId, userId } });
  if (!thread) return null;

  const messages = await Message.findAll({
    where: { threadId: thread.id },
    order: [["createdAt", "ASC"]],
  });

  await Message.update(
    { readAt: new Date() },
    { where: { threadId: thread.id, senderType: { [Op.ne]: "customer" }, readAt: null } },
  );

  return {
    id: thread.id,
    subject: thread.subject,
    topic: thread.topic,
    orderNumber: thread.orderNumber,
    avatarKind: thread.avatarKind,
    icon: thread.icon,
    tagLabel: thread.tagLabel,
    tagStyle: thread.tagStyle,
    messages: messages.map((m) => ({
      id: m.id,
      senderType: m.senderType,
      senderName: m.senderName,
      body: m.body,
      createdAt: m.createdAt,
    })),
  };
}

// Screen 29's compose screen posts straight to "WeDoHalal Team" — there's
// no real staff inbox to route to yet (the admin panel is being built
// separately), so every new thread and reply gets an immediate automated
// acknowledgement from the team, matching the mockup's simulated
// `sendMessage()` reply-after-delay behaviour (see the downloaded mockup's
// `<script>` block) without pretending a human answered instantly.
export async function createThread(userId: number, input: NewThreadInput) {
  const label = TOPIC_LABELS[input.topic];
  const tagStyle = TOPIC_TAG_STYLE[input.topic];
  const subject = input.orderNumber
    ? `${label} — Order #${input.orderNumber.replace(/^#/, "")}`
    : label;

  const thread = await MessageThread.create({
    userId,
    topic: input.topic,
    subject,
    orderNumber: input.orderNumber ? input.orderNumber.replace(/^#/, "") : null,
    avatarKind: "staff",
    icon: null,
    tagLabel: input.orderNumber ? `Order #${input.orderNumber.replace(/^#/, "")}` : label,
    tagStyle,
    lastMessageAt: new Date(),
  });

  await Message.create({
    threadId: thread.id,
    senderType: "customer",
    senderName: null,
    body: input.body,
    readAt: new Date(),
  });

  await Message.create({
    threadId: thread.id,
    senderType: "staff",
    senderName: "Haris — WeDoHalal",
    body: STAFF_AUTO_REPLY,
    readAt: null,
  });

  return thread;
}

export async function replyToThread(userId: number, threadId: number, body: string) {
  const thread = await MessageThread.findOne({ where: { id: threadId, userId } });
  if (!thread) return null;

  const customerMessage = await Message.create({
    threadId: thread.id,
    senderType: "customer",
    senderName: null,
    body,
    readAt: new Date(),
  });

  const staffMessage = await Message.create({
    threadId: thread.id,
    senderType: "staff",
    senderName: "Haris — WeDoHalal",
    body: STAFF_AUTO_REPLY,
    readAt: null,
  });

  await thread.update({ lastMessageAt: staffMessage.createdAt });

  return { customerMessage, staffMessage };
}

// New accounts land on an empty inbox otherwise — Screen 29's mockup
// always shows a "Welcome to WeDoHalal Wholesale" thread as the oldest
// entry, so lazily create one the first time a user's inbox is read (same
// lazy-create-with-defaults pattern as NotificationPreference).
//
// Wrapped in React's `cache()` so the check-then-create below only runs
// once per request even though both /messages/layout.tsx and
// /messages/page.tsx call listThreads() independently (the account phase's
// established "each page refetches its own data" convention) — without
// this, those two concurrent calls could each see zero welcome threads and
// both insert one.
const ensureWelcomeThread = cache(async (userId: number) => {
  const existing = await MessageThread.count({ where: { userId, topic: "welcome" } });
  if (existing > 0) return;

  const thread = await MessageThread.create({
    userId,
    topic: "welcome",
    subject: "Welcome to WeDoHalal Wholesale",
    orderNumber: null,
    avatarKind: "staff",
    icon: null,
    tagLabel: "Welcome",
    tagStyle: "system",
    lastMessageAt: new Date(),
  });

  await Message.create({
    threadId: thread.id,
    senderType: "staff",
    senderName: "WeDoHalal Team",
    body:
      "Welcome to WeDoHalal Wholesale! Your account is set up and ready to order. If you ever have a question about an order, an invoice, or anything else, just message us here — we usually reply within the hour during support hours.",
    readAt: null,
  });
});
