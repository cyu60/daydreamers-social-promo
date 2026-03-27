import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { projectDescription, brandColors, tone } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are an expert social media marketer and copywriter. Your job is to generate promotional content for projects across multiple channels.

Always respond in the following exact format with these section headers. Do not deviate from this format:

---LINKEDIN---
[LinkedIn post content here - professional, 1-3 paragraphs, include a call to action]

---INSTAGRAM---
[Instagram caption here - engaging, with emojis where appropriate, include 15-20 relevant hashtags at the end]

---TWITTER---
[Twitter/X thread here - write as a thread with numbered tweets (1/, 2/, etc.), 3-5 tweets, each under 280 characters]

---EMAIL---
[Email announcement here - include Subject: line, then a greeting, body paragraphs, and sign-off]

Tone: ${tone || "Professional"}
${brandColors ? `Brand colors for reference: ${brandColors}` : ""}`,
    prompt: `Generate promotional content for the following project:\n\n${projectDescription}`,
    onError({ error }) {
      console.error("Stream error:", error);
    },
  });

  return result.toTextStreamResponse();
}
