import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  const { projectName, projectDescription, brandColors, tone, platform } = await req.json();

  // Generate HTML template for the social media image
  const result = await generateText({
    model: openai("gpt-5.4"),
    system: `You are a visual designer. Generate a self-contained HTML file that renders a social media promotional image.

The HTML must:
- Be a single, complete HTML document with inline CSS
- Have a fixed size based on the platform:
  - LinkedIn: 1200x627px
  - Instagram: 1080x1080px
  - Twitter: 1200x675px
- Use the provided brand colors (or default to a modern dark theme with blue accents)
- Include the project name prominently
- Include a tagline or key benefit
- Have a professional, polished design
- Use Google Fonts (DM Sans, DM Serif Display) via CDN link
- Include a subtle gradient background
- NOT use any external images (only CSS shapes, gradients, and text)

Output ONLY the HTML code, nothing else. No explanation, no markdown code fences.`,
    prompt: `Create a ${platform || "LinkedIn"} promotional image for:
Project: ${projectName || "My Project"}
Description: ${projectDescription}
Brand colors: ${brandColors || "#1c3fdc, #0a0a0f, #f5f2ed"}
Tone: ${tone || "Professional"}`,
  });

  return Response.json({ html: result.text });
}
