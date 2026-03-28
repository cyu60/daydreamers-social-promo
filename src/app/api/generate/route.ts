import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { projectDescription, brandColors, tone, inspirationPosts } = await req.json();

  let inspirationSection = "";
  if (inspirationPosts && inspirationPosts.length > 0) {
    inspirationSection = `\n\nHere are example posts from influencers the user admires. Match their style, tone, and formatting patterns:\n\n${inspirationPosts.join("\n\n---\n\n")}`;
  }

  const result = streamText({
    model: openai("gpt-5.4"),
    system: `You are an expert social media marketer and copywriter. Generate promotional content that is READY TO PASTE directly into each platform.

CRITICAL FORMATTING RULES:
- NEVER use markdown syntax. No #, ##, ###, *, **, ***, \`, \`\`\`, >, -, or any markdown.
- For LinkedIn and Twitter/X: use Unicode bold characters for emphasis. To make text bold, use the Unicode Mathematical Sans-Serif Bold alphabet (U+1D5D4–U+1D607). For example: "𝗧𝗵𝗶𝘀 𝗶𝘀 𝗯𝗼𝗹𝗱" not "**This is bold**".
- For bullet points, use the actual bullet character • or emoji ▸ — not markdown dashes.
- Use blank lines between paragraphs for readability.
- Use emojis naturally where appropriate (🚀, 💡, ✅, 🔗, etc.)
- The output must look perfect when pasted directly into LinkedIn, Twitter/X, Instagram, or an email client with ZERO editing needed.

Unicode bold reference (use these exact characters for bold text):
𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭 𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇 𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵

Always respond in this exact format with these section headers:

---LINKEDIN---
Write a professional LinkedIn post using plain text with Unicode bold for emphasis. Use line breaks for readability. Include a call-to-action. No markdown whatsoever.

---INSTAGRAM---
Write an engaging Instagram caption in plain text. Use Unicode bold for key phrases, include relevant emojis, and add 15-20 hashtags at the end as a single paragraph.

---TWITTER---
Write a Twitter/X thread in plain text. Format as numbered tweets (1/, 2/, etc.), each under 280 characters. Use Unicode bold for hooks. No markdown.

---EMAIL---
Write an email announcement in plain text suitable for an email client. Start with a Subject: line, then greeting, body with Unicode bold highlights, bullet points using •, and a sign-off.

---IMAGE_PROMPT---
Write a detailed prompt (2-3 sentences) for generating a promotional social media image. Describe visual style, colors, composition, and key text to include.

Tone: ${tone || "Professional"}
${brandColors ? `Brand colors to reference: ${brandColors}` : ""}${inspirationSection}`,
    prompt: `Generate promotional content for the following project:\n\n${projectDescription}`,
    onError({ error }) {
      console.error("Stream error:", error);
    },
  });

  return result.toTextStreamResponse();
}
