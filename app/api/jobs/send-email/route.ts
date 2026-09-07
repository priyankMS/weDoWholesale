import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { sendEmail, type SendEmailInput } from "@/lib/email/send";

// The QStash "worker" for every queued email — lib/queue/emailQueue.ts
// publishes the SendEmailInput payload here, QStash calls this route with
// an at-least-once, auto-retried delivery, and we just hand it to
// sendEmail(). This is the only place a queued email actually leaves the
// building.
//
// Deliberately NOT wrapped in `verifySignatureAppRouter` (the SDK's usual
// helper) — that helper reads QSTASH_CURRENT_SIGNING_KEY/NEXT_SIGNING_KEY
// and *throws at import time* if either is missing, which would break
// `next build`/local dev entirely before QStash is provisioned. Verifying
// the signature manually, inside the request handler, keeps that check
// deferred to request time — consistent with how lib/stripe.ts and
// lib/email/send.ts lazily tolerate missing config.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!currentSigningKey || !nextSigningKey) {
    return NextResponse.json({ error: "QStash not configured" }, { status: 503 });
  }

  const signature = request.headers.get("upstash-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 403 });
  }

  const body = await request.text();
  const receiver = new Receiver({ currentSigningKey, nextSigningKey });
  try {
    await receiver.verify({ signature, body });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const input = JSON.parse(body) as SendEmailInput;
  await sendEmail(input);
  return NextResponse.json({ ok: true });
}
