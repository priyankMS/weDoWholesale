import { apiClient } from "@/lib/api/client";

export async function markAllAnnouncementsRead(): Promise<void> {
  await apiClient.post("/announcements/mark-all-read");
}
