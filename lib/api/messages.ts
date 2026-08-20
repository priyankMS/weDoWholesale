import { apiClient } from "@/lib/api/client";
import type { NewThreadInput, ReplyMessageInput } from "@/lib/validation/messages";

export async function createThread(input: NewThreadInput): Promise<{ thread: { id: number } }> {
  const res = await apiClient.post("/messages", input);
  return res.data;
}

export async function replyToThread(threadId: number, input: ReplyMessageInput) {
  const res = await apiClient.post(`/messages/${threadId}/reply`, input);
  return res.data as {
    customerMessage: { id: number; body: string; createdAt: string };
    staffMessage: { id: number; body: string; senderName: string; createdAt: string };
  };
}
