import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { projectDescription, brandColors, tone } = await req.json();

  const result = streamText({
    model: openai("gpt-5.4"),
    system: `You are an expert social media marketer and copywriter. Generate promotional content in well-formatted markdown.

Always respond in this exact format with these section headers:

---LINKEDIN---
Write a professional LinkedIn post in markdown. Use **bold** for emphasis, line breaks for readability. Include a call-to-action at the end.

---INSTAGRAM---
Write an engaging Instagram caption in markdown. Use **bold** for key phrases, include relevant emojis, and add 15-20 hashtags at the end formatted as a single paragraph.

---TWITTER---
Write a Twitter/X thread in markdown. Format as a numbered list (1/, 2/, etc.), each tweet under 280 characters. Use **bold** for hooks.

---EMAIL---
Write an email announcement in markdown. Start with **Subject:** line, then a greeting, body with **bold** highlights, bullet points for key features, and a sign-off.

---IMAGE_PROMPT---
Write a detailed prompt (2-3 sentences) for generating a promotional social media image for this project. Describe the visual style, colors, composition, and key text to include. This will be used with an AI image generator.

Tone: ${tone || "Professional"}
${brandColors ? `Brand colors to reference: ${brandColors}` : ""}`,
    prompt: `Generate promotional content for the following project:\n\n${projectDescription}`,
    onError({ error }) {
      console.error("Stream error:", error);
    },
  });

  return result.toTextStreamResponse();
}
