import { getQStashClient } from "@/lib/queue/qstash";
import { sendEmail, type SendEmailInput } from "@/lib/email/send";
import { emailBaseUrl } from "@/lib/email/theme";


export async function enqueueEmail(input: SendEmailInput): Promise<boolean> {
  const client = getQStashClient();
  if (!client) {
    // No queue configured (e.g. local dev) — send inline, but a transport
    // failure here (bad SMTP creds, an unverified sender domain, provider
    // downtime) must not take the whole request down with it. Every
    // caller — order confirmations, password resets, etc. — expects the
    // rest of its work (DB writes already committed) to still succeed even
    // if the notification itself couldn't go out.
    try {
      await sendEmail(input);
      return true;
    } catch (err) {
      console.error(`[email-queue] Failed to send "${input.subject}" to ${input.to}:`, err);
      return false;
    }
  }

  try {
    await client.publishJSON({
      url: `${emailBaseUrl()}/api/jobs/send-email`,
      body: input,
      retries: 3,
    });
    return true;
  } catch (err) {
    console.error(`[email-queue] Failed to enqueue "${input.subject}" for ${input.to}:`, err);
    return false;
  }
}
