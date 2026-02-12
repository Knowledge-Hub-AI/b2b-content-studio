import OpenAI from "openai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = (await req.json()) as {
      prompt: string;
      projectId?: string;
      instruction?: string | null;
      templateSystemPrompt?: string | null;
    };

    if (!process.env.OPENAI_API_KEY) {
      return new Response("Missing OPENAI_API_KEY", { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new Response("User not found", { status: 401 });
    }

    // 🔥 Template-aware system prompt
    const defaultSystem =
      "You are an expert B2B technology content writer. Output Markdown. Do not invent stats, quotes, customers, awards, certifications.";

    const system =
      body.templateSystemPrompt && body.templateSystemPrompt.trim().length > 0
        ? body.templateSystemPrompt.trim()
        : defaultSystem;

    const r = await client.responses.create({
      model: "gpt-5",
      input: [
        { role: "system", content: system },
        { role: "user", content: body.prompt },
      ],
    });

    const text = r.output_text ?? "";

    return Response.json({ text });
  } catch (e: any) {
    console.error(e);
    return new Response(e?.message || "Server error", { status: 500 });
  }
}
