"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/portal/ToastProvider";
import { Button } from "@/components/ui/Button";
import { FormCard, FormField, Select, TextInput } from "@/components/ui/FormCard";
import { getApiErrorMessage } from "@/lib/api/error";
import { createThread } from "@/lib/api/messages";
import { NEW_THREAD_TOPICS, NEW_THREAD_TOPIC_LABELS, type NewThreadTopic } from "@/lib/validation/messages";

// Screen 29's "New message" compose screen.
export function NewThreadForm() {
  const router = useRouter();
  const showToast = useToast();
  const [topic, setTopic] = useState<NewThreadTopic>("general");
  const [orderNumber, setOrderNumber] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    if (!body.trim()) {
      showToast("Please write your message first");
      return;
    }
    setSending(true);
    try {
      const { thread } = await createThread({
        topic,
        orderNumber: orderNumber.trim() || undefined,
        body,
      });
      showToast("Message sent ✓ — we'll reply within the hour");
      router.push(`/messages/${thread.id}`);
    } catch (err) {
      showToast(getApiErrorMessage(err, "Couldn't send that message"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="px-4 pt-4 pb-8 lg:px-0 lg:max-w-140">
      <FormCard>
        <FormField label="To">
          <div className="flex items-center gap-2.5 py-1.5 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-[0.78rem] font-extrabold text-white">
              W
            </div>
            <span className="text-[0.9rem] font-medium text-neutral-900">WeDoHalal Team</span>
          </div>
        </FormField>
        <FormField label="Topic">
          <Select value={topic} onChange={(e) => setTopic(e.target.value as NewThreadTopic)}>
            {NEW_THREAD_TOPICS.map((t) => (
              <option key={t} value={t}>
                {NEW_THREAD_TOPIC_LABELS[t]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Order (optional)">
          <TextInput
            placeholder="e.g. WDH-3841"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </FormField>
      </FormCard>

      <div className="mb-3 rounded-2xl border-[1.5px] border-neutral-200 bg-white p-1">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe your question or issue in detail. The more context you give, the faster we can help."
          className="min-h-40 w-full resize-none border-none bg-transparent px-3.5 py-3.5 font-sans text-[0.9rem] text-neutral-900 leading-relaxed outline-none placeholder:text-neutral-400"
        />
      </div>

      <Button type="button" onClick={handleSubmit} disabled={sending}>
        {sending ? "Sending…" : "Send message →"}
      </Button>
      <div className="h-2" />
      <a
        href="https://wa.me/17807227623"
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-4 text-[0.92rem] font-extrabold text-white transition-colors hover:bg-[#1aad55]"
      >
        💬 Message us on WhatsApp instead
      </a>
    </div>
  );
}
