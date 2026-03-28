import { openai } from "@ai-sdk/openai";
import { generateImage } from "ai";

const SIZES: Record<string, { width: number; height: number }> = {
  LinkedIn: { width: 1200, height: 627 },
  Instagram: { width: 1080, height: 1080 },
  Twitter: { width: 1200, height: 675 },
};

export async function POST(req: Request) {
  const { projectName, projectDescription, brandColors, tone, platform } =
    await req.json();

  const size = SIZES[platform || "LinkedIn"] || SIZES.LinkedIn;
  const aspect =
    platform === "Instagram"
      ? "1:1"
      : platform === "Twitter"
      ? "16:9"
      : "16:9";

  const prompt = `Create a professional social media promotional image for a project called "${projectName || "My Project"}".

Description: ${projectDescription}
${brandColors ? `Brand colors: ${brandColors}` : "Use a modern dark theme with blue accents."}
Tone: ${tone || "Professional"}
Platform: ${platform || "LinkedIn"} (${size.width}x${size.height}px, ${aspect} aspect ratio)

Requirements:
- Clean, modern design suitable for ${platform || "LinkedIn"}
- Feature the project name prominently as text
- Include a short tagline or key benefit
- Professional gradient or solid background
- No stock photos or faces
- Bold typography with good contrast
- Tech/startup aesthetic`;

  const result = await generateImage({
    model: openai.image("gpt-image-1"),
    prompt,
    size: aspect === "1:1" ? "1024x1024" : "1536x1024",
  });

  const base64 = result.image.base64;
  const imageUrl = `data:image/png;base64,${base64}`;

  return Response.json({ imageUrl });
}
