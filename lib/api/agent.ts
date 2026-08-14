import { apiClient } from "@/lib/api/client";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type AgentResponse = { message: string };

export async function sendAgentMessage(
  messages: ChatMessage[],
): Promise<AgentResponse> {
  const res = await apiClient.post<AgentResponse>("/agent", { messages });
  return res.data;
}
