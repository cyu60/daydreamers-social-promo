"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AuthBanner } from "@/components/auth-guard";
import { insforge } from "@/lib/insforge";

type ChannelKey = "linkedin" | "instagram" | "twitter" | "email" | "image_prompt";

const CHANNELS: { key: ChannelKey; label: string; separator: string; icon: string }[] = [
  { key: "linkedin", label: "LinkedIn", separator: "---LINKEDIN---", icon: "M0 1.8C0 .8.8 0 1.8 0h12.4C15.2 0 16 .8 16 1.8v12.4c0 1-.8 1.8-1.8 1.8H1.8C.8 16 0 15.2 0 14.2V1.8zM4.8 13.5V6.2H2.5v7.3h2.3zM3.6 5.2a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6zM13.5 13.5V9.4c0-2.2-1.2-3.3-2.8-3.3-1.3 0-1.8.7-2.1 1.2V6.2H6.3v7.3h2.3V9.7c0-.2 0-.4.1-.5.2-.5.7-1 1.4-1 1 0 1.4.8 1.4 1.9v3.4h2.3z" },
  { key: "instagram", label: "Instagram", separator: "---INSTAGRAM---", icon: "M8 0C5.8 0 5.6.01 4.7.05 3.8.09 3.2.22 2.7.42c-.53.2-.98.48-1.42.92-.44.44-.72.89-.92 1.42-.2.5-.33 1.1-.37 2C.01 5.6 0 5.8 0 8s.01 2.4.05 3.3c.04.9.17 1.5.37 2 .2.53.48.98.92 1.42.44.44.89.72 1.42.92.5.2 1.1.33 2 .37.9.04 1.1.05 3.3.05s2.4-.01 3.3-.05c.9-.04 1.5-.17 2-.37.53-.2.98-.48 1.42-.92.44-.44.72-.89.92-1.42.2-.5.33-1.1.37-2 .04-.9.05-1.1.05-3.3s-.01-2.4-.05-3.3c-.04-.9-.17-1.5-.37-2-.2-.53-.48-.98-.92-1.42A3.9 3.9 0 0013.3.42c-.5-.2-1.1-.33-2-.37C10.4.01 10.2 0 8 0zm0 1.44c2.14 0 2.39.01 3.23.05.78.03 1.2.16 1.48.27.37.14.64.32.92.6.28.28.46.55.6.92.11.28.24.7.27 1.48.04.84.05 1.09.05 3.23s-.01 2.39-.05 3.23c-.03.78-.16 1.2-.27 1.48-.14.37-.32.64-.6.92-.28.28-.55.46-.92.6-.28.11-.7.24-1.48.27-.84.04-1.09.05-3.23.05s-2.39-.01-3.23-.05c-.78-.03-1.2-.16-1.48-.27a2.5 2.5 0 01-.92-.6 2.5 2.5 0 01-.6-.92c-.11-.28-.24-.7-.27-1.48-.04-.84-.05-1.09-.05-3.23s.01-2.39.05-3.23c.03-.78.16-1.2.27-1.48.14-.37.32-.64.6-.92.28-.28.55-.46.92-.6.28-.11.7-.24 1.48-.27.84-.04 1.09-.05 3.23-.05zM8 3.89a4.11 4.11 0 100 8.22 4.11 4.11 0 000-8.22zM8 10.67a2.67 2.67 0 110-5.34 2.67 2.67 0 010 5.34zm5.23-6.97a.96.96 0 11-1.92 0 .96.96 0 011.92 0z" },
  { key: "twitter", label: "Twitter/X", separator: "---TWITTER---", icon: "M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633z" },
  { key: "email", label: "Email", separator: "---EMAIL---", icon: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" },
  { key: "image_prompt", label: "Image Prompt", separator: "---IMAGE_PROMPT---", icon: "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" },
];

const TONES = ["Professional", "Casual", "Exciting"] as const;

function parseContent(raw: string): Record<ChannelKey, string> {
  const result: Record<ChannelKey, string> = { linkedin: "", instagram: "", twitter: "", email: "", image_prompt: "" };
  for (let i = 0; i < CHANNELS.length; i++) {
    const channel = CHANNELS[i];
    const startIdx = raw.indexOf(channel.separator);
    if (startIdx === -1) continue;
    const contentStart = startIdx + channel.separator.length;
    const nextChannel = CHANNELS[i + 1];
    const endIdx = nextChannel ? raw.indexOf(nextChannel.separator, contentStart) : raw.length;
    result[channel.key] = raw.slice(contentStart, endIdx === -1 ? undefined : endIdx).trim();
  }
  return result;
}

function IframeScaler({ html, nativeWidth, nativeHeight }: { html: string; nativeWidth: number; nativeHeight: number }) {
  const [scale, setScale] = useState(1);
  const wrapRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const containerWidth = entry.contentRect.width;
      setScale(containerWidth / nativeWidth);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [nativeWidth]);

  const scaledHeight = nativeHeight * scale;

  return (
    <div ref={wrapRef} className="iframe-scaler-wrap" style={{ height: scaledHeight }}>
      <div className="iframe-scaler-inner" style={{ height: scaledHeight }}>
        <iframe
          srcDoc={html}
          style={{
            width: nativeWidth,
            height: nativeHeight,
            transform: `scale(${scale})`,
          }}
          sandbox="allow-scripts"
          title="Image preview"
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [projectDescription, setProjectDescription] = useState("");
  const [brandColors, setBrandColors] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawOutput, setRawOutput] = useState("");
  const [copiedChannel, setCopiedChannel] = useState<ChannelKey | null>(null);
  const [activeTab, setActiveTab] = useState<ChannelKey>("linkedin");
  const [imageHtml, setImageHtml] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imagePlatform, setImagePlatform] = useState("LinkedIn");
  const [imageMode, setImageMode] = useState<"ai" | "template">("ai");
  const [aiImageUrl, setAiImageUrl] = useState("");
  const [designSystem, setDesignSystem] = useState("");
  const [editedContent, setEditedContent] = useState<Partial<Record<ChannelKey, string>>>({});
  const [isPosting, setIsPosting] = useState<Record<string, boolean>>({});
  const [postResults, setPostResults] = useState<Record<string, { success: boolean; url?: string; error?: string }>>({});
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [canPublish, setCanPublish] = useState(false);

  // Upload-Post settings (localStorage-backed)
  const [userApiKey, setUserApiKey] = useState("");
  const [userProfile, setUserProfile] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Inspiration state (localStorage-backed)
  type Inspiration = { id: string; name: string; linkedin_url: string; sample_posts: string[] };
  const [inspirationOpen, setInspirationOpen] = useState(false);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [newInfluencerName, setNewInfluencerName] = useState("");
  const [newInfluencerUrl, setNewInfluencerUrl] = useState("");
  const [editingPostsId, setEditingPostsId] = useState<string | null>(null);
  const [editingPostsText, setEditingPostsText] = useState("");

  const saveInspirations = useCallback((items: Inspiration[]) => {
    setInspirations(items);
    localStorage.setItem("dd_inspirations", JSON.stringify(items));
  }, []);

  useEffect(() => {
    insforge.auth.getCurrentUser().then((result) => {
      const user = result.data?.user;
      setIsSignedIn(!!user);
      const email = (user as { email?: string })?.email;
      setCanPublish(email === "chinatchinat123@gmail.com");
    }).catch(() => {});
    // Load from localStorage
    try {
      const stored = localStorage.getItem("dd_inspirations");
      if (stored) setInspirations(JSON.parse(stored));
      const savedKey = localStorage.getItem("dd_upload_post_key");
      if (savedKey) setUserApiKey(savedKey);
      const savedProfile = localStorage.getItem("dd_upload_post_profile");
      if (savedProfile) setUserProfile(savedProfile);
      const savedDesign = localStorage.getItem("dd_design_system");
      if (savedDesign) setDesignSystem(savedDesign);
    } catch { /* ignore */ }
  }, []);

  const handleAddInfluencer = useCallback(() => {
    if (!newInfluencerName.trim()) return;
    const item: Inspiration = {
      id: crypto.randomUUID(),
      name: newInfluencerName.trim(),
      linkedin_url: newInfluencerUrl.trim(),
      sample_posts: [],
    };
    saveInspirations([...inspirations, item]);
    setNewInfluencerName("");
    setNewInfluencerUrl("");
    // Auto-open paste for the new influencer
    setEditingPostsId(item.id);
    setEditingPostsText("");
  }, [newInfluencerName, newInfluencerUrl, inspirations, saveInspirations]);

  const handleRemoveInfluencer = useCallback((id: string) => {
    saveInspirations(inspirations.filter((i) => i.id !== id));
  }, [inspirations, saveInspirations]);

  const handleSavePosts = useCallback((id: string) => {
    const posts = editingPostsText
      .split("\n---\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    saveInspirations(
      inspirations.map((i) => (i.id === id ? { ...i, sample_posts: posts } : i))
    );
    setEditingPostsId(null);
    setEditingPostsText("");
  }, [editingPostsText, inspirations, saveInspirations]);

  const getInspirationPosts = useCallback((): string[] => {
    return inspirations.flatMap((i) => i.sample_posts.filter((p) => p.length > 0));
  }, [inspirations]);

  const parsedContent = parseContent(rawOutput);

  const getDisplayContent = (key: ChannelKey) => {
    return editedContent[key] ?? parsedContent[key];
  };

  const handleGenerate = useCallback(async () => {
    if (!projectDescription.trim()) return;
    setIsGenerating(true);
    setRawOutput("");
    setEditedContent({});
    setPostResults({});
    let accumulated = "";
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectDescription, brandColors, tone, inspirationPosts: getInspirationPosts(), designSystem }),
      });
      if (!response.ok) throw new Error("Failed to generate content");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setRawOutput(accumulated);
      }
    } catch (error) {
      console.error("Generation error:", error);
      setRawOutput("Error generating content. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
      // Save generation if user is logged in
      try {
        const { data } = await insforge.auth.getCurrentUser();
        if (data?.user) {
          const parsed = parseContent(accumulated);
          await insforge.database.from("generations").insert({
            user_id: data.user.id,
            project_description: projectDescription,
            tone,
            brand_colors: brandColors,
            linkedin_content: parsed.linkedin,
            instagram_content: parsed.instagram,
            twitter_content: parsed.twitter,
            email_content: parsed.email,
          });
        }
      } catch {
        // silently fail if not logged in
      }
    }
  }, [projectDescription, brandColors, tone, getInspirationPosts]);

  const handlePost = useCallback(async (platform: "linkedin" | "x") => {
    const channelKey: ChannelKey = platform === "x" ? "twitter" : "linkedin";
    const text = getDisplayContent(channelKey);
    if (!text) return;

    setIsPosting((prev) => ({ ...prev, [platform]: true }));
    setPostResults((prev) => {
      const next = { ...prev };
      delete next[platform];
      return next;
    });

    try {
      const response = await fetch("/api/post-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          platforms: [platform],
          ...(userApiKey && { apiKey: userApiKey, profile: userProfile || "default" }),
        }),
      });
      const data = await response.json();
      if (data.success && data.results?.[platform]) {
        setPostResults((prev) => ({ ...prev, [platform]: data.results[platform] }));
      } else {
        setPostResults((prev) => ({ ...prev, [platform]: { success: false, error: data.error || "Failed to post" } }));
      }
    } catch {
      setPostResults((prev) => ({ ...prev, [platform]: { success: false, error: "Network error" } }));
    } finally {
      setIsPosting((prev) => ({ ...prev, [platform]: false }));
    }
  }, [editedContent, parsedContent, userApiKey, userProfile]);

  const handleCopy = useCallback(async (channel: ChannelKey, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedChannel(channel);
    setTimeout(() => setCopiedChannel(null), 2000);
  }, []);

  const handleGenerateImage = useCallback(async () => {
    setImageLoading(true);
    setImageHtml("");
    setAiImageUrl("");
    try {
      const endpoint = imageMode === "ai" ? "/api/generate-image-ai" : "/api/generate-image";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: projectDescription.split('\n')[0].substring(0, 50),
          projectDescription,
          brandColors,
          tone,
          platform: imagePlatform,
        }),
      });
      const data = await response.json();
      if (imageMode === "ai" && data.imageUrl) {
        setAiImageUrl(data.imageUrl);
      } else if (data.html) {
        setImageHtml(data.html);
      }
    } catch (error) {
      console.error("Image generation error:", error);
    } finally {
      setImageLoading(false);
    }
  }, [projectDescription, brandColors, tone, imagePlatform, imageMode]);

  const hasContent = CHANNELS.some((ch) => parsedContent[ch.key].length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <style>{`
        @media (max-width: 480px) {
          .header-label { display: none; }
          .main-pad { padding-left: 1rem !important; padding-right: 1rem !important; padding-top: 1.5rem !important; }
          .card-pad { padding: 1rem !important; }
          .footer-inner { flex-direction: column !important; align-items: flex-start !important; gap: 0.75rem !important; }
          .tone-btn { font-size: 0.72rem !important; padding: 0 0.5rem !important; }
          .prose h1 { font-size: 1.2em !important; }
          .prose h2 { font-size: 1.1em !important; }
          .prose h3 { font-size: 1em !important; }
        }
        .iframe-scaler-wrap {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 8px;
          border: 1.5px solid var(--rule);
          background: #fff;
        }
        .iframe-scaler-inner {
          position: relative;
          width: 100%;
        }
        .iframe-scaler-inner iframe {
          position: absolute;
          top: 0;
          left: 0;
          transform-origin: top left;
          border: none;
        }
      `}</style>

      <AuthBanner />

      {/* Header */}
      <header
        style={{
          borderBottom: "1.5px solid var(--rule)",
          background: "rgba(245,242,237,0.85)",
          backdropFilter: "blur(14px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-[52px] flex items-center justify-between gap-3">
          <a href="https://www.daydreamers-academy.com" target="_blank" rel="noopener" className="flex items-center gap-2.5 no-underline flex-shrink-0">
            <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path fill="none" stroke="#1c3fdc" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" d="M166 82c-8-4-17-6-27-6c-32 0-58 26-58 58s26 58 58 58c26 0 48-17 55-41c-7 4-16 6-25 6c-26 0-46-20-46-46c0-12 4-22 11-29c7-7 20-7 32 0z"/>
            </svg>
            <span style={{ fontFamily: "var(--font-serif, 'DM Serif Display', Georgia, serif)", fontSize: "1rem", color: "var(--ink)" }}>
              DayDreamers
            </span>
          </a>
          <span className="header-label" style={{ fontFamily: "var(--font-mono)", fontSize: "0.67rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--dust)", textAlign: "right" as const }}>
            Social Promo Generator
          </span>
        </div>
      </header>

      <main className="main-pad mx-auto max-w-5xl w-full px-4 sm:px-6 py-6 sm:py-10 flex-1">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-10">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "var(--cobalt)", marginBottom: "0.5rem" }}>
            AI-Powered Content
          </p>
          <h1 style={{ fontFamily: "var(--font-serif, 'DM Serif Display', Georgia, serif)", fontSize: "clamp(1.5rem, 5vw, 2.8rem)", color: "var(--ink)", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
            Generate Your <em style={{ fontStyle: "italic", color: "var(--cobalt)" }}>Promo Content</em>
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--dust)", marginTop: "0.6rem", maxWidth: "520px", margin: "0.6rem auto 0", lineHeight: 1.6 }}>
            Describe your project and get tailored promotional content for LinkedIn, Instagram, Twitter/X, and email &mdash; all in one click.
          </p>
        </div>

        {/* Input Card */}
        <div
          className="card-pad"
          style={{
            background: "rgba(255,255,255,0.62)",
            border: "1px solid rgba(16,17,26,0.10)",
            borderRadius: "24px",
            padding: "1.5rem 1.75rem",
            boxShadow: "0 16px 36px rgba(16,17,26,0.05)",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.5rem" }}>Project Details</h3>
          <p style={{ fontSize: "0.82rem", color: "var(--dust)", lineHeight: 1.6, marginBottom: "1rem" }}>
            Paste your project URL or describe what you built. We&apos;ll generate channel-specific promotional content.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="project-description" style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--ink)", display: "block", marginBottom: "0.35rem" }}>
                Project URL or Description
              </label>
              <Textarea
                id="project-description"
                placeholder="e.g., https://myproject.com — or describe your project in detail..."
                className="min-h-[120px] resize-y"
                style={{ background: "var(--paper)", border: "1.5px solid var(--rule)", borderRadius: "12px", fontSize: "0.85rem" }}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>

            {/* Design System Import */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--ink)" }}>
                  Design System <span style={{ color: "var(--dust)", fontWeight: 400 }}>(optional)</span>
                </label>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  {designSystem && (
                    <button
                      onClick={() => { setDesignSystem(""); localStorage.removeItem("dd_design_system"); }}
                      style={{ fontSize: "0.68rem", fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: "999px", border: "1.5px solid var(--rule)", background: "var(--paper)", color: "var(--dust)", cursor: "pointer" }}
                    >
                      Clear
                    </button>
                  )}
                  <label style={{ fontSize: "0.68rem", fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: "999px", border: "1.5px solid var(--cobalt)", background: "var(--cobalt-dim)", color: "var(--cobalt)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                    <svg viewBox="0 0 24 24" fill="var(--cobalt)" style={{ width: "11px", height: "11px" }}><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
                    Import .md
                    <input
                      type="file"
                      accept=".md,.txt"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const text = ev.target?.result as string;
                            setDesignSystem(text);
                            localStorage.setItem("dd_design_system", text);
                          };
                          reader.readAsText(file);
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
              {designSystem ? (
                <div style={{ background: "var(--paper)", border: "1.5px solid var(--green)", borderRadius: "12px", padding: "0.6rem 0.8rem", fontSize: "0.78rem", color: "var(--ink)", lineHeight: 1.5 }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--green)", display: "block", marginBottom: "0.2rem" }}>Design system loaded ({Math.round(designSystem.length / 1024)}KB)</span>
                  <span style={{ color: "var(--dust)", fontSize: "0.72rem" }}>{designSystem.slice(0, 120).replace(/[#*]/g, "")}...</span>
                </div>
              ) : (
                <Textarea
                  placeholder="Paste your design.md content here, or import a file above..."
                  className="min-h-[60px] resize-y"
                  style={{ background: "var(--paper)", border: "1.5px solid var(--rule)", borderRadius: "12px", fontSize: "0.78rem" }}
                  value={designSystem}
                  onChange={(e) => {
                    setDesignSystem(e.target.value);
                    if (e.target.value) localStorage.setItem("dd_design_system", e.target.value);
                  }}
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="brand-colors" style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--ink)", display: "block", marginBottom: "0.35rem" }}>
                  Brand Colors <span style={{ color: "var(--dust)", fontWeight: 400 }}>(optional)</span>
                </label>
                <Input
                  id="brand-colors"
                  placeholder="e.g., #1c3fdc, navy blue"
                  style={{ background: "var(--paper)", border: "1.5px solid var(--rule)", borderRadius: "12px", fontSize: "0.85rem", height: "42px" }}
                  value={brandColors}
                  onChange={(e) => setBrandColors(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--ink)", display: "block", marginBottom: "0.35rem" }}>
                  Tone
                </label>
                <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                  {TONES.map((t) => (
                    <button
                      key={t}
                      className="tone-btn"
                      onClick={() => setTone(t)}
                      style={{
                        flex: "1 1 0",
                        minWidth: 0,
                        height: "42px",
                        borderRadius: "999px",
                        border: tone === t ? "1.5px solid var(--cobalt)" : "1.5px solid var(--rule)",
                        background: tone === t ? "var(--cobalt-dim)" : "var(--paper)",
                        color: tone === t ? "var(--cobalt)" : "var(--ink)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.16s ease",
                        whiteSpace: "nowrap" as const,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload-Post Settings — collapsible */}
            <div
              style={{
                border: "1.5px solid var(--rule)",
                borderRadius: "14px",
                background: "var(--paper)",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.7rem 1rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <svg viewBox="0 0 24 24" fill="var(--dust)" style={{ width: "14px", height: "14px" }}>
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z" />
                  </svg>
                  Post to Social Settings
                  {userApiKey && (
                    <span style={{ fontSize: "0.65rem", background: "var(--green-dim)", color: "var(--green)", padding: "0.15rem 0.45rem", borderRadius: "999px", fontWeight: 600 }}>
                      Connected
                    </span>
                  )}
                </span>
                <svg viewBox="0 0 16 16" fill="var(--dust)" style={{ width: "12px", height: "12px", transform: settingsOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                  <path d="M4.6 5.4L8 8.8l3.4-3.4L13 6.8l-5 5-5-5z" />
                </svg>
              </button>

              {settingsOpen && (
                <div style={{ padding: "0 1rem 1rem", borderTop: "1px solid var(--rule)" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--dust)", lineHeight: 1.5, margin: "0.65rem 0 0.75rem" }}>
                    Connect your own <a href="https://app.upload-post.com/api-keys" target="_blank" rel="noopener" style={{ color: "var(--cobalt)", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid rgba(28,63,220,0.2)" }}>Upload-Post API key</a> to publish directly to your LinkedIn &amp; X accounts.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--ink)", display: "block", marginBottom: "0.25rem" }}>
                        API Key
                      </label>
                      <input
                        type="password"
                        placeholder="Paste your Upload-Post API key"
                        value={userApiKey}
                        onChange={(e) => {
                          setUserApiKey(e.target.value);
                          localStorage.setItem("dd_upload_post_key", e.target.value);
                        }}
                        style={{ width: "100%", height: "36px", fontSize: "0.78rem", padding: "0 0.7rem", borderRadius: "8px", border: "1.5px solid var(--rule)", background: "rgba(255,255,255,0.6)", fontFamily: "var(--font-mono)" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--ink)", display: "block", marginBottom: "0.25rem" }}>
                        Profile Name <span style={{ color: "var(--dust)", fontWeight: 400 }}>(from Upload-Post)</span>
                      </label>
                      <input
                        placeholder="e.g. my-profile"
                        value={userProfile}
                        onChange={(e) => {
                          setUserProfile(e.target.value);
                          localStorage.setItem("dd_upload_post_profile", e.target.value);
                        }}
                        style={{ width: "100%", height: "36px", fontSize: "0.78rem", padding: "0 0.7rem", borderRadius: "8px", border: "1.5px solid var(--rule)", background: "rgba(255,255,255,0.6)" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "0.65rem", padding: "0.6rem 0.75rem", background: "var(--cobalt-dim)", borderRadius: "8px", fontSize: "0.72rem", lineHeight: 1.6, color: "var(--ink)" }}>
                    <strong>How to set up:</strong>
                    <ol style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem" }}>
                      <li>Sign up at <a href="https://www.upload-post.com" target="_blank" rel="noopener" style={{ color: "var(--cobalt)", fontWeight: 600, textDecoration: "none" }}>upload-post.com</a></li>
                      <li>Go to <a href="https://app.upload-post.com/api-keys" target="_blank" rel="noopener" style={{ color: "var(--cobalt)", fontWeight: 600, textDecoration: "none" }}>API Keys</a> and create a key</li>
                      <li>Create a profile and connect your LinkedIn / X accounts</li>
                      <li>Paste your API key and profile name above</li>
                    </ol>
                  </div>

                  {userApiKey && (
                    <button
                      onClick={() => {
                        setUserApiKey("");
                        setUserProfile("");
                        localStorage.removeItem("dd_upload_post_key");
                        localStorage.removeItem("dd_upload_post_profile");
                      }}
                      style={{ marginTop: "0.5rem", fontSize: "0.72rem", fontWeight: 600, padding: "0.3rem 0.7rem", borderRadius: "999px", border: "1.5px solid var(--rule)", background: "var(--paper)", color: "var(--dust)", cursor: "pointer" }}
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Inspiration Sources — collapsible */}
            {isSignedIn && (
              <div
                style={{
                  border: "1.5px solid var(--rule)",
                  borderRadius: "14px",
                  background: "var(--paper)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setInspirationOpen(!inspirationOpen)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 1rem",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ color: "var(--cobalt)", fontSize: "0.9rem" }}>&#10022;</span>
                    Inspiration Sources
                    {inspirations.length > 0 && (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          background: "var(--cobalt-dim)",
                          color: "var(--cobalt)",
                          padding: "0.1rem 0.45rem",
                          borderRadius: "999px",
                          fontWeight: 700,
                        }}
                      >
                        {inspirations.length}
                      </span>
                    )}
                  </span>
                  <svg
                    viewBox="0 0 16 16"
                    fill="var(--dust)"
                    style={{
                      width: "12px",
                      height: "12px",
                      transform: inspirationOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <path d="M4.6 5.4L8 8.8l3.4-3.4L13 6.8l-5 5-5-5z" />
                  </svg>
                </button>

                {inspirationOpen && (
                  <div style={{ padding: "0 1rem 1rem", borderTop: "1px solid var(--rule)" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--dust)", lineHeight: 1.5, margin: "0.65rem 0 0.75rem" }}>
                      Add influencers whose writing style you admire. Their posts will guide the AI&apos;s tone and formatting.
                    </p>

                    {/* List of influencers */}
                    {inspirations.map((insp) => {
                      const posts = insp.sample_posts;
                      return (
                        <div
                          key={insp.id}
                          style={{
                            border: "1px solid var(--rule)",
                            borderRadius: "10px",
                            padding: "0.6rem 0.8rem",
                            marginBottom: "0.5rem",
                            background: "rgba(255,255,255,0.5)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--ink)" }}>
                                {insp.name}
                              </span>
                              {insp.linkedin_url && (
                                <a
                                  href={insp.linkedin_url}
                                  target="_blank"
                                  rel="noopener"
                                  style={{
                                    fontSize: "0.7rem",
                                    color: "var(--cobalt)",
                                    marginLeft: "0.4rem",
                                    textDecoration: "none",
                                  }}
                                >
                                  LinkedIn &rarr;
                                </a>
                              )}
                              {posts.length > 0 && (
                                <span style={{ fontSize: "0.68rem", color: "var(--dust)", marginLeft: "0.4rem" }}>
                                  {posts.length} post{posts.length !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: "0.3rem", flexShrink: 0 }}>
                              <button
                                onClick={() => {
                                  if (editingPostsId === insp.id) {
                                    setEditingPostsId(null);
                                  } else {
                                    setEditingPostsId(insp.id);
                                    setEditingPostsText(posts.join("\n---\n"));
                                  }
                                }}
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 600,
                                  padding: "0.25rem 0.55rem",
                                  borderRadius: "999px",
                                  border: editingPostsId === insp.id ? "1.5px solid var(--cobalt)" : "1.5px solid var(--rule)",
                                  background: editingPostsId === insp.id ? "var(--cobalt-dim)" : "var(--paper)",
                                  color: editingPostsId === insp.id ? "var(--cobalt)" : "var(--dust)",
                                  cursor: "pointer",
                                }}
                              >
                                Paste
                              </button>
                              <button
                                onClick={() => handleRemoveInfluencer(insp.id)}
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 600,
                                  padding: "0.25rem 0.55rem",
                                  borderRadius: "999px",
                                  border: "1.5px solid var(--rule)",
                                  background: "var(--paper)",
                                  color: "var(--dust)",
                                  cursor: "pointer",
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          {/* Truncated posts preview */}
                          {posts.length > 0 && editingPostsId !== insp.id && (
                            <p style={{ fontSize: "0.72rem", color: "var(--dust)", marginTop: "0.35rem", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                              {posts[0].slice(0, 120)}{posts[0].length > 120 ? "..." : ""}
                            </p>
                          )}

                          {/* Paste / Edit posts textarea */}
                          {editingPostsId === insp.id && (
                            <div style={{ marginTop: "0.5rem" }}>
                              <textarea
                                value={editingPostsText}
                                onChange={(e) => setEditingPostsText(e.target.value)}
                                placeholder={"Paste example posts here.\nSeparate multiple posts with a line containing only ---"}
                                style={{
                                  width: "100%",
                                  minHeight: "100px",
                                  fontSize: "0.78rem",
                                  lineHeight: 1.6,
                                  padding: "0.6rem",
                                  borderRadius: "8px",
                                  border: "1.5px solid var(--rule)",
                                  background: "var(--paper)",
                                  color: "var(--ink)",
                                  resize: "vertical",
                                  fontFamily: "var(--font-sans)",
                                }}
                              />
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.3rem", marginTop: "0.35rem" }}>
                                <button
                                  onClick={() => { setEditingPostsId(null); setEditingPostsText(""); }}
                                  style={{
                                    fontSize: "0.68rem",
                                    fontWeight: 600,
                                    padding: "0.25rem 0.6rem",
                                    borderRadius: "999px",
                                    border: "1.5px solid var(--rule)",
                                    background: "var(--paper)",
                                    color: "var(--dust)",
                                    cursor: "pointer",
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSavePosts(insp.id)}
                                  style={{
                                    fontSize: "0.68rem",
                                    fontWeight: 600,
                                    padding: "0.25rem 0.6rem",
                                    borderRadius: "999px",
                                    border: "none",
                                    background: "var(--cobalt)",
                                    color: "#fff",
                                    cursor: "pointer",
                                  }}
                                >
                                  Save Posts
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add influencer form */}
                    <div
                      style={{
                        display: "flex",
                        gap: "0.4rem",
                        flexWrap: "wrap",
                        marginTop: inspirations.length > 0 ? "0.5rem" : 0,
                      }}
                    >
                      <Input
                        placeholder="Name"
                        value={newInfluencerName}
                        onChange={(e) => setNewInfluencerName(e.target.value)}
                        style={{
                          flex: "1 1 120px",
                          height: "36px",
                          fontSize: "0.78rem",
                          borderRadius: "999px",
                          border: "1.5px solid var(--rule)",
                          background: "rgba(255,255,255,0.6)",
                        }}
                      />
                      <Input
                        placeholder="LinkedIn URL (optional)"
                        value={newInfluencerUrl}
                        onChange={(e) => setNewInfluencerUrl(e.target.value)}
                        style={{
                          flex: "2 1 180px",
                          height: "36px",
                          fontSize: "0.78rem",
                          borderRadius: "999px",
                          border: "1.5px solid var(--rule)",
                          background: "rgba(255,255,255,0.6)",
                        }}
                      />
                      <button
                        onClick={handleAddInfluencer}
                        disabled={!newInfluencerName.trim()}
                        style={{
                          height: "36px",
                          padding: "0 0.85rem",
                          borderRadius: "999px",
                          border: "none",
                          background: false || !newInfluencerName.trim() ? "var(--rule)" : "var(--cobalt)",
                          color: "#fff",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: false || !newInfluencerName.trim() ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        {false ? "Adding..." : "+ Add"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !projectDescription.trim()}
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "999px",
                background: isGenerating || !projectDescription.trim() ? "var(--rule)" : "var(--cobalt)",
                color: "#fff",
                fontSize: "0.88rem",
                fontWeight: 600,
                border: "none",
                cursor: isGenerating || !projectDescription.trim() ? "not-allowed" : "pointer",
                transition: "all 0.16s ease",
              }}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate Content"
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {(hasContent || isGenerating) && (
          <div
            className="card-pad"
            style={{
              background: "rgba(255,255,255,0.62)",
              border: "1px solid rgba(16,17,26,0.10)",
              borderRadius: "24px",
              padding: "1.5rem 1.75rem",
              boxShadow: "0 16px 36px rgba(16,17,26,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", fontWeight: 700, color: "#fff", background: "var(--cobalt)", width: "20px", height: "20px", borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>1</span>
              <h3 style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>Text Content</h3>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--dust)", lineHeight: 1.6, marginBottom: "1rem" }}>
              Click each channel tab to view, edit, and copy your content.
            </p>

            {/* Channel Tabs */}
            <div style={{ display: "flex", gap: "0.35rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              {CHANNELS.map((ch) => (
                <button
                  key={ch.key}
                  onClick={() => setActiveTab(ch.key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.45rem 0.85rem",
                    borderRadius: "999px",
                    border: activeTab === ch.key ? "1.5px solid var(--cobalt)" : "1.5px solid var(--rule)",
                    background: activeTab === ch.key ? "var(--cobalt-dim)" : "transparent",
                    color: activeTab === ch.key ? "var(--cobalt)" : "var(--dust)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.16s ease",
                  }}
                >
                  <svg viewBox={ch.key === "email" || ch.key === "image_prompt" ? "0 0 24 24" : "0 0 16 16"} fill="currentColor" style={{ width: "13px", height: "13px" }}>
                    <path d={ch.icon} />
                  </svg>
                  {ch.label}
                  {parsedContent[ch.key] && (
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--cobalt)" }} />
                  )}
                </button>
              ))}
            </div>

            {/* Active Content */}
            {CHANNELS.map((ch) => {
              if (ch.key !== activeTab) return null;
              const displayText = getDisplayContent(ch.key);
              const isPostable = ch.key === "linkedin" || ch.key === "twitter";
              const postPlatform = ch.key === "twitter" ? "x" : "linkedin";
              return (
                <div key={ch.key}>
                  {displayText ? (
                    <>
                      <div
                        style={{
                          background: "var(--paper)",
                          border: "1.5px solid var(--rule)",
                          borderRadius: "12px",
                          overflow: "hidden",
                        }}
                      >
                        {/* Card header with channel name and action buttons */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.65rem 1.2rem",
                            borderBottom: "1px solid var(--rule)",
                            background: "rgba(255,255,255,0.5)",
                            gap: "0.4rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--dust)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                            {ch.label}
                          </span>
                          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                            {/* Copy */}
                            <button
                              onClick={() => handleCopy(ch.key, displayText)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.32rem",
                                background: copiedChannel === ch.key ? "#16a34a" : "var(--cobalt)",
                                color: "#fff",
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                padding: "0.36rem 0.7rem",
                                borderRadius: "999px",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.16s ease",
                              }}
                            >
                              {copiedChannel === ch.key ? "Copied!" : "Copy"}
                            </button>
                            {/* Publish button (LinkedIn & Twitter only, signed in only) */}
                            {isPostable && (canPublish || userApiKey) && (
                              <button
                                onClick={() => handlePost(postPlatform as "linkedin" | "x")}
                                disabled={isPosting[postPlatform]}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.32rem",
                                  background: postResults[postPlatform]?.success ? "#16a34a" : isPosting[postPlatform] ? "var(--rule)" : "#0a0a0f",
                                  color: "#fff",
                                  fontSize: "0.72rem",
                                  fontWeight: 600,
                                  padding: "0.36rem 0.7rem",
                                  borderRadius: "999px",
                                  border: "none",
                                  cursor: isPosting[postPlatform] ? "not-allowed" : "pointer",
                                  transition: "all 0.16s ease",
                                }}
                              >
                                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "12px", height: "12px" }}>
                                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                                {isPosting[postPlatform]
                                  ? "Posting..."
                                  : postResults[postPlatform]?.success
                                  ? "Posted!"
                                  : `Post to ${ch.key === "twitter" ? "X" : "LinkedIn"}`}
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Post result feedback */}
                        {postResults[postPlatform] && isPostable && (
                          <div style={{
                            padding: "0.5rem 1.2rem",
                            borderBottom: "1px solid var(--rule)",
                            background: postResults[postPlatform].success ? "var(--green-dim)" : "var(--amber-dim)",
                            fontSize: "0.78rem",
                          }}>
                            {postResults[postPlatform].success ? (
                              <span style={{ color: "var(--green)" }}>
                                Published! <a href={postResults[postPlatform].url} target="_blank" rel="noopener" style={{ fontWeight: 600, textDecoration: "underline" }}>View post &rarr;</a>
                              </span>
                            ) : (
                              <span style={{ color: "var(--amber)" }}>
                                Error: {postResults[postPlatform].error}
                              </span>
                            )}
                          </div>
                        )}
                        {/* Content — click to edit inline */}
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newText = e.currentTarget.innerText;
                            if (newText !== parsedContent[ch.key]) {
                              setEditedContent((prev) => ({ ...prev, [ch.key]: newText }));
                            }
                          }}
                          style={{
                            padding: "1.1rem 1.2rem",
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.85rem",
                            lineHeight: 1.7,
                            color: "var(--ink)",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word" as const,
                            outline: "none",
                            cursor: "text",
                            minHeight: "80px",
                          }}
                          dangerouslySetInnerHTML={{ __html: displayText.replace(/\n/g, "<br>") }}
                        />
                      </div>
                    </>
                  ) : isGenerating ? (
                    <div style={{ padding: "1.1rem 1.2rem", background: "var(--paper)", borderRadius: "12px", border: "1.5px solid var(--rule)" }}>
                      <div className="space-y-3">
                        <div style={{ height: "14px", width: "75%", borderRadius: "6px", background: "var(--cream)" }} className="animate-pulse" />
                        <div style={{ height: "14px", width: "100%", borderRadius: "6px", background: "var(--cream)" }} className="animate-pulse" />
                        <div style={{ height: "14px", width: "85%", borderRadius: "6px", background: "var(--cream)" }} className="animate-pulse" />
                        <div style={{ height: "14px", width: "65%", borderRadius: "6px", background: "var(--cream)" }} className="animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div style={{ borderRadius: "12px", border: "1.5px dashed var(--rule)", padding: "2rem", textAlign: "center" }}>
                      <p style={{ fontSize: "0.82rem", color: "var(--dust)" }}>Content for {ch.label} will appear here.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Step 2: Image Generation */}
        {hasContent && (
          <div
            className="card-pad"
            style={{
              background: "rgba(255,255,255,0.62)",
              border: "1px solid rgba(16,17,26,0.10)",
              borderRadius: "24px",
              padding: "1.5rem 1.75rem",
              boxShadow: "0 16px 36px rgba(16,17,26,0.05)",
              marginTop: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", fontWeight: 700, color: "#fff", background: "var(--cobalt)", width: "20px", height: "20px", borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>2</span>
              <h3 style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>Image Assets</h3>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--dust)", lineHeight: 1.6, marginBottom: "1rem" }}>
              Generate a promotional image to attach to your social post.
            </p>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <select
                value={imageMode}
                onChange={(e) => { setImageMode(e.target.value as "ai" | "template"); setImageHtml(""); setAiImageUrl(""); }}
                style={{
                  height: "36px",
                  padding: "0 0.7rem",
                  borderRadius: "10px",
                  border: "1.5px solid var(--rule)",
                  background: "var(--paper)",
                  color: "var(--ink)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <option value="ai">AI Image</option>
                <option value="template">HTML Template</option>
              </select>
              {["LinkedIn", "Instagram", "Twitter"].map((p) => (
                <button
                  key={p}
                  onClick={() => setImagePlatform(p)}
                  style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: "999px",
                    border: imagePlatform === p ? "1.5px solid var(--cobalt)" : "1.5px solid var(--rule)",
                    background: imagePlatform === p ? "var(--cobalt-dim)" : "transparent",
                    color: imagePlatform === p ? "var(--cobalt)" : "var(--dust)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={handleGenerateImage}
                disabled={imageLoading || !projectDescription.trim()}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "999px",
                  border: "none",
                  background: imageLoading || !projectDescription.trim() ? "var(--rule)" : "var(--cobalt)",
                  color: "#fff",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: imageLoading || !projectDescription.trim() ? "not-allowed" : "pointer",
                }}
              >
                {imageLoading ? "Generating..." : "Generate Image"}
              </button>
            </div>

            <p style={{ fontSize: "0.72rem", color: "var(--dust)", marginBottom: "0.75rem" }}>
              {imageMode === "ai" ? "Uses AI to generate a unique promotional image — downloadable as PNG." : "Generates an HTML/CSS template — screenshot to use as an image."}
            </p>

            {/* AI-generated image */}
            {aiImageUrl && (
              <>
                <div style={{ borderRadius: "10px", overflow: "hidden", border: "1.5px solid var(--rule)" }}>
                  <img src={aiImageUrl} alt="AI-generated promotional image" style={{ width: "100%", display: "block" }} />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem", justifyContent: "flex-end" }}>
                  <a
                    href={aiImageUrl}
                    download="promo-image.png"
                    target="_blank"
                    rel="noopener"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.32rem",
                      background: "var(--cobalt)", color: "#fff", fontSize: "0.75rem",
                      fontWeight: 600, padding: "0.4rem 0.85rem", borderRadius: "999px",
                      border: "none", cursor: "pointer", textDecoration: "none",
                    }}
                  >
                    Download Image
                  </a>
                </div>
              </>
            )}

            {/* HTML template */}
            {imageHtml && (
              <>
                <IframeScaler
                  html={imageHtml}
                  nativeWidth={imagePlatform === "Instagram" ? 1080 : 1200}
                  nativeHeight={imagePlatform === "LinkedIn" ? 627 : imagePlatform === "Instagram" ? 1080 : 675}
                />
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => { navigator.clipboard.writeText(imageHtml); }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.32rem",
                      background: "var(--cobalt)", color: "#fff", fontSize: "0.75rem",
                      fontWeight: 600, padding: "0.4rem 0.85rem", borderRadius: "999px",
                      border: "none", cursor: "pointer",
                    }}
                  >
                    Copy HTML
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1.5px solid var(--rule)", marginTop: "auto" }}>
        <div className="footer-inner mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path fill="none" stroke="var(--dust)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" d="M166 82c-8-4-17-6-27-6c-32 0-58 26-58 58s26 58 58 58c26 0 48-17 55-41c-7 4-16 6-25 6c-26 0-46-20-46-46c0-12 4-22 11-29c7-7 20-7 32 0z"/>
            </svg>
            <p style={{ fontSize: "0.72rem", color: "var(--dust)" }}>
              Built by <span style={{ fontWeight: 600, color: "var(--ink)" }}>DayDreamers</span>
            </p>
          </div>
          <a
            href="https://www.daydreamers-academy.com"
            target="_blank"
            rel="noopener"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.32rem",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--cobalt)",
              textDecoration: "none",
              padding: "0.3rem 0.65rem",
              borderRadius: "999px",
              border: "1px solid rgba(28,63,220,0.15)",
              background: "var(--cobalt-dim)",
              transition: "all 0.16s ease",
            }}
          >
            daydreamers-academy.com
            <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: "10px", height: "10px" }}>
              <path d="M6 3l5 5-5 5-1.4-1.4L8.2 8 4.6 4.4z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
