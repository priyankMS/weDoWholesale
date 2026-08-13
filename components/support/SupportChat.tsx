"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content:
    "Hi! I'm the WeDoHalal Wholesale assistant. Ask me about delivery, minimum orders, payment terms, or your application status.",
};

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
    });

    const data = await res.json();
    setLoading(false);
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content: res.ok
          ? data.message
          : (data.error ?? "Something went wrong. Try WhatsApp instead."),
      },
    ]);
  }

  return (
    <div className="fixed right-4 bottom-20 z-100 lg:right-6 lg:bottom-6">
      {open && (
        <div className="mb-3 flex h-[28rem] w-[calc(100vw-2rem)] max-w-90 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-charcoal-900 px-4 py-3.5">
            <div>
              <div className="font-serif text-sm font-black text-white">
                WeDoHalal Support
              </div>
              <div className="text-[0.68rem] text-white/50">
                Usually replies within the hour
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-lg text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto p-3.5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.84rem] leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-primary-500 text-white"
                    : "bg-neutral-100 text-neutral-900"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-2xl bg-neutral-100 px-3.5 py-2.5 text-[0.84rem] text-neutral-400">
                Typing…
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-neutral-200 p-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 rounded-full border border-neutral-200 px-3.5 py-2 text-[0.84rem] outline-none focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-full bg-primary-500 px-4 py-2 text-[0.84rem] font-bold text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-2xl text-white shadow-lg transition-colors hover:bg-primary-600"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
