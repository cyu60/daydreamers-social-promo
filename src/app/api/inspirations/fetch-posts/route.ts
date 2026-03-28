import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { linkedin_url } = await req.json();

  if (!linkedin_url) {
    return NextResponse.json({ posts: [], message: "No URL provided." });
  }

  // Extract username from LinkedIn URL
  const match = linkedin_url.match(/linkedin\.com\/in\/([^/?#]+)/);
  if (!match) {
    return NextResponse.json({
      posts: [],
      message: "Invalid LinkedIn URL. Paste posts manually.",
    });
  }

  const username = match[1];
  const activityUrl = `https://www.linkedin.com/in/${username}/recent-activity/all/`;

  try {
    const response = await fetch(activityUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({
        posts: [],
        message:
          "Could not fetch LinkedIn posts (blocked or private). Paste posts manually.",
      });
    }

    const html = await response.text();

    // Try to extract post text from the HTML — LinkedIn public pages sometimes
    // include post content in <span> elements inside article markup.
    const postTexts: string[] = [];
    const regex =
      /data-test-id="main-feed-activity-content"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/gi;
    let m;
    while ((m = regex.exec(html)) !== null && postTexts.length < 5) {
      const text = m[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .trim();
      if (text.length > 30) {
        postTexts.push(text.slice(0, 500));
      }
    }

    if (postTexts.length > 0) {
      return NextResponse.json({ posts: postTexts, message: "Fetched posts." });
    }

    return NextResponse.json({
      posts: [],
      message:
        "LinkedIn blocked automatic fetching. Paste posts manually below.",
    });
  } catch {
    return NextResponse.json({
      posts: [],
      message:
        "LinkedIn blocked automatic fetching. Paste posts manually below.",
    });
  }
}
