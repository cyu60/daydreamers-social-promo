"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type ChannelKey = "linkedin" | "instagram" | "twitter" | "email";

const CHANNELS: { key: ChannelKey; label: string; separator: string }[] = [
  { key: "linkedin", label: "LinkedIn", separator: "---LINKEDIN---" },
  { key: "instagram", label: "Instagram", separator: "---INSTAGRAM---" },
  { key: "twitter", label: "Twitter/X", separator: "---TWITTER---" },
  { key: "email", label: "Email", separator: "---EMAIL---" },
];

const TONES = ["Professional", "Casual", "Exciting"] as const;

function parseContent(
  raw: string
): Record<ChannelKey, string> {
  const result: Record<ChannelKey, string> = {
    linkedin: "",
    instagram: "",
    twitter: "",
    email: "",
  };

  for (let i = 0; i < CHANNELS.length; i++) {
    const channel = CHANNELS[i];
    const startIdx = raw.indexOf(channel.separator);
    if (startIdx === -1) continue;

    const contentStart = startIdx + channel.separator.length;
    const nextChannel = CHANNELS[i + 1];
    const endIdx = nextChannel
      ? raw.indexOf(nextChannel.separator, contentStart)
      : raw.length;

    result[channel.key] = raw
      .slice(contentStart, endIdx === -1 ? undefined : endIdx)
      .trim();
  }

  return result;
}

export default function Home() {
  const [projectDescription, setProjectDescription] = useState("");
  const [brandColors, setBrandColors] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawOutput, setRawOutput] = useState("");
  const [copiedChannel, setCopiedChannel] = useState<ChannelKey | null>(null);

  const parsedContent = parseContent(rawOutput);

  const handleGenerate = useCallback(async () => {
    if (!projectDescription.trim()) return;

    setIsGenerating(true);
    setRawOutput("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectDescription, brandColors, tone }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

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
    }
  }, [projectDescription, brandColors, tone]);

  const handleCopy = useCallback(async (channel: ChannelKey, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedChannel(channel);
    setTimeout(() => setCopiedChannel(null), 2000);
  }, []);

  const hasContent = CHANNELS.some((ch) => parsedContent[ch.key].length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--cobalt)] flex items-center justify-center">
              <span className="text-sm font-bold text-white">D</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                DayDreamers Social Promo
              </h1>
              <p className="text-xs text-muted-foreground">
                Generate promotional content across channels
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="text-xs font-mono"
          >
            AI-Powered
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Details</CardTitle>
            <CardDescription>
              Describe your project or paste a URL. We will generate tailored
              promotional content for each channel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="project-description"
                className="text-sm font-medium text-foreground"
              >
                Project URL or Description
              </label>
              <Textarea
                id="project-description"
                placeholder="e.g., https://myproject.com or describe your project in detail..."
                className="min-h-[120px] resize-y"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="brand-colors"
                  className="text-sm font-medium text-foreground"
                >
                  Brand Colors{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <Input
                  id="brand-colors"
                  placeholder="e.g., #1c3fdc, navy blue"
                  value={brandColors}
                  onChange={(e) => setBrandColors(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tone
                </label>
                <div className="flex gap-2">
                  {TONES.map((t) => (
                    <Button
                      key={t}
                      variant={tone === t ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setTone(t)}
                      className={
                        tone === t
                          ? "bg-[var(--cobalt)] text-white hover:bg-[var(--cobalt)]/90"
                          : ""
                      }
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !projectDescription.trim()}
              className="w-full bg-[var(--cobalt)] text-white hover:bg-[var(--cobalt)]/90 h-11 text-sm font-medium"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate Content"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {(hasContent || isGenerating) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Generated Content</CardTitle>
              <CardDescription>
                Click on each tab to view and copy the content for that channel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="linkedin">
                <TabsList className="w-full justify-start">
                  {CHANNELS.map((ch) => (
                    <TabsTrigger key={ch.key} value={ch.key} className="text-xs">
                      {ch.label}
                      {parsedContent[ch.key] && (
                        <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--cobalt)]" />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {CHANNELS.map((ch) => (
                  <TabsContent key={ch.key} value={ch.key}>
                    <div className="relative mt-4">
                      {parsedContent[ch.key] ? (
                        <>
                          <div className="rounded-lg border border-border bg-secondary/50 p-4">
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                              {parsedContent[ch.key]}
                            </pre>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handleCopy(ch.key, parsedContent[ch.key])
                              }
                              className="text-xs"
                            >
                              {copiedChannel === ch.key ? (
                                <span className="flex items-center gap-1.5">
                                  <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Copied!
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <rect
                                      x="9"
                                      y="9"
                                      width="13"
                                      height="13"
                                      rx="2"
                                    />
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                  </svg>
                                  Copy {ch.label}
                                </span>
                              )}
                            </Button>
                          </div>
                        </>
                      ) : isGenerating ? (
                        <div className="space-y-3 p-4">
                          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                          <div className="h-4 w-full animate-pulse rounded bg-muted" />
                          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border p-8 text-center">
                          <p className="text-sm text-muted-foreground">
                            Content for {ch.label} will appear here.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="mx-auto max-w-4xl px-6 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Built by{" "}
            <span className="font-medium text-foreground">DayDreamers</span>{" "}
            &mdash; Powered by Claude
          </p>
        </div>
      </footer>
    </div>
  );
}
