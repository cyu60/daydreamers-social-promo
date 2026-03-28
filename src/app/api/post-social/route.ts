import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.UPLOAD_POST_API_KEY;
const API_URL = "https://api.upload-post.com/api/upload_text";
const PROFILE = "daydreamers";

const VALID_PLATFORMS = new Set(["linkedin", "x"]);

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Upload-Post API key not configured" },
      { status: 500 }
    );
  }

  const { text, platforms } = await req.json();

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const validPlatforms = (platforms as string[]).filter((p) =>
    VALID_PLATFORMS.has(p)
  );
  if (validPlatforms.length === 0) {
    return NextResponse.json(
      { error: "At least one valid platform required (linkedin, x)" },
      { status: 400 }
    );
  }

  const form = new FormData();
  form.append("user", PROFILE);
  form.append("title", text.trim());
  form.append("async_upload", "false");
  for (const p of validPlatforms) {
    form.append("platform[]", p);
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: `Apikey ${API_KEY}` },
    body: form,
  });

  const data = await response.json();

  if (!data.success) {
    return NextResponse.json(
      { error: data.message || "Failed to post" },
      { status: 500 }
    );
  }

  const results: Record<string, { success: boolean; url?: string; error?: string }> = {};
  for (const [platform, result] of Object.entries(data.results || {})) {
    const r = result as { success: boolean; url?: string; error?: string };
    results[platform] = {
      success: r.success,
      url: r.url,
      error: r.error,
    };
  }

  return NextResponse.json({ success: true, results });
}
