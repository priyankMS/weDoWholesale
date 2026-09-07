import { getQStashClient } from "@/lib/queue/qstash";
import { sendEmail, type SendEmailInput } from "@/lib/email/send";
import { emailBaseUrl } from "@/lib/email/theme";


export async function enqueueEmail(input: SendEmailInput): Promise<boolean> {
  const client = getQStashClient();
  if (!client) {
    await sendEmail(input);
    return true;
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
