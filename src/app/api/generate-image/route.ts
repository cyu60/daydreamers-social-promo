import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  const { projectName, projectDescription, brandColors, tone, platform } = await req.json();

  // Generate HTML template for the social media image
  const result = await generateText({
    model: openai("gpt-5.4"),
    system: `You are a visual designer. Generate a self-contained HTML file that renders a social media promotional image.

CRITICAL SIZING RULES — the generated image MUST fill the entire canvas with ZERO white space:
- The <html> and <body> must have: margin: 0; padding: 0; overflow: hidden;
- The outermost container div must have: width: {WIDTH}px; height: {HEIGHT}px; overflow: hidden; position: relative;
- The background color or gradient MUST cover the ENTIRE canvas — no white gaps anywhere
- Platform dimensions (use these EXACT pixel values):
  - LinkedIn: width: 1200px; height: 627px;
  - Instagram: width: 1080px; height: 1080px;
  - Twitter: width: 1200px; height: 675px;

MANDATORY HTML STRUCTURE:
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: {WIDTH}px; height: {HEIGHT}px; overflow: hidden; }
</style>
</head><body>
<div style="width: {WIDTH}px; height: {HEIGHT}px; overflow: hidden; position: relative; background: ...">
  <!-- ALL CONTENT HERE -->
</div>
</body></html>
\`\`\`

Other requirements:
- Use the provided brand colors (or default to a modern dark theme with blue accents)
- Include the project name prominently
- Include a tagline or key benefit
- Professional, polished design
- Use Google Fonts (DM Sans, DM Serif Display) via CDN link
- Background must be a gradient or solid color that fills the ENTIRE canvas
- NOT use any external images (only CSS shapes, gradients, and text)
- The design must look complete and professional with NO white borders or gaps

Output ONLY the HTML code, nothing else. No explanation, no markdown code fences.`,
    prompt: `Create a ${platform || "LinkedIn"} promotional image for:
Project: ${projectName || "My Project"}
Description: ${projectDescription}
Brand colors: ${brandColors || "#1c3fdc, #0a0a0f, #f5f2ed"}
Tone: ${tone || "Professional"}`,
  });

  // Post-process: ensure zero margins even if the LLM forgot
  let html = result.text;
  // Strip markdown code fences if present
  html = html.replace(/^```(?:html?)?\n?/i, "").replace(/\n?```$/i, "").trim();
  // Inject reset styles if not already present
  if (!html.includes("margin: 0") && !html.includes("margin:0")) {
    html = html.replace(
      "<head>",
      `<head><style>*{margin:0;padding:0;box-sizing:border-box}html,body{overflow:hidden}</style>`
    );
  }
  return Response.json({ html });
}
