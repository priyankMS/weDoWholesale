import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { User } from "@/lib/db/models/User";
import { buildSystemPrompt } from "@/lib/agent/systemPrompt";

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Support chat is not configured yet. Message us on WhatsApp instead." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const session = await getSession();
  const user = session ? await User.findByPk(session.userId) : null;

  const anthropic = new Anthropic({ apiKey });
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 512,
    system: buildSystemPrompt(user),
    messages: parsed.data.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return NextResponse.json({ message: text });
}
