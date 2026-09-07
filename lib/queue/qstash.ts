import { Client } from "@upstash/qstash";

// Lazy-init QStash publisher client — mirrors lib/stripe.ts and
// lib/email/send.ts's transporter: built on first use, not at module load,
// so the app still boots (and `next build` still succeeds) without
// QSTASH_TOKEN configured. Callers should treat a null return as "no queue
// available" and fall back to doing the work inline, same as sendEmail
// already does when SMTP isn't configured.
let cachedClient: Client | null | undefined;

export function getQStashClient(): Client | null {
  if (cachedClient !== undefined) return cachedClient;

  const token = process.env.QSTASH_TOKEN;
  // QSTASH_URL matters here: Upstash now has region-specific QStash
  // endpoints (e.g. the US region's console gives you a token that's only
  // valid against https://qstash-us-east-1.upstash.io, not the global
  // default) — passed explicitly rather than left to the SDK's own
  // QSTASH_URL env fallback, so this doesn't silently break if that
  // fallback behaviour ever changes.
  cachedClient = token ? new Client({ token, baseUrl: process.env.QSTASH_URL }) : null;
  return cachedClient;
}
