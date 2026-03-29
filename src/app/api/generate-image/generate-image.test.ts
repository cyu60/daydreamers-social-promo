import { describe, it, expect } from "vitest";

/**
 * Tests for the HTML post-processing logic in generate-image route.
 * The route processes LLM output to ensure zero white margins.
 */

function postProcessHtml(raw: string): string {
  let html = raw;
  // Strip markdown code fences if present
  html = html.replace(/^```(?:html?)?\n?/i, "").replace(/\n?```$/i, "").trim();
  // Inject reset styles if not already present
  if (!html.includes("margin: 0") && !html.includes("margin:0")) {
    html = html.replace(
      "<head>",
      `<head><style>*{margin:0;padding:0;box-sizing:border-box}html,body{overflow:hidden}</style>`
    );
  }
  return html;
}

describe("generate-image post-processing", () => {
  it("strips markdown code fences from LLM output", () => {
    const input = '```html\n<html><head></head><body>hello</body></html>\n```';
    const result = postProcessHtml(input);
    expect(result).not.toContain("```");
    expect(result).toContain("<html>");
  });

  it("strips code fences without html language tag", () => {
    const input = '```\n<html><head></head><body>hello</body></html>\n```';
    const result = postProcessHtml(input);
    expect(result).not.toContain("```");
  });

  it("injects reset styles when missing margin:0", () => {
    const input = "<html><head></head><body><div>content</div></body></html>";
    const result = postProcessHtml(input);
    expect(result).toContain("margin:0");
    expect(result).toContain("padding:0");
    expect(result).toContain("overflow:hidden");
    expect(result).toContain("box-sizing:border-box");
  });

  it("does NOT double-inject if margin: 0 already present", () => {
    const input =
      '<html><head><style>* { margin: 0; padding: 0; }</style></head><body></body></html>';
    const result = postProcessHtml(input);
    // Should not have the injected style since margin: 0 already exists
    const matches = result.match(/margin/g);
    expect(matches?.length).toBe(1); // Only the original one
  });

  it("does NOT double-inject if margin:0 (no space) already present", () => {
    const input =
      "<html><head><style>*{margin:0;padding:0}</style></head><body></body></html>";
    const result = postProcessHtml(input);
    const matches = result.match(/margin:0/g);
    expect(matches?.length).toBe(1);
  });

  it("preserves the rest of the HTML unchanged", () => {
    const input =
      '<html><head><style>.foo{color:red}</style></head><body><div class="container">Hello World</div></body></html>';
    const result = postProcessHtml(input);
    expect(result).toContain("Hello World");
    expect(result).toContain(".foo{color:red}");
    expect(result).toContain('class="container"');
  });

  it("handles HTML with Google Fonts link", () => {
    const input = `<html><head><link href="https://fonts.googleapis.com/css2?family=DM+Sans" rel="stylesheet"></head><body><div style="width:1200px;height:627px">content</div></body></html>`;
    const result = postProcessHtml(input);
    expect(result).toContain("fonts.googleapis.com");
    expect(result).toContain("margin:0");
  });

  it("handles already clean output (no fences, has margin:0)", () => {
    const input =
      '<html><head><style>*{margin:0;padding:0;box-sizing:border-box}html,body{overflow:hidden}</style></head><body><div style="width:1080px;height:1080px;background:#0a0a0f">Instagram</div></body></html>';
    const result = postProcessHtml(input);
    // Should be unchanged
    expect(result).toBe(input);
  });

  it("ensures the output contains no leading/trailing whitespace", () => {
    const input = "  \n  <html><head></head><body>x</body></html>  \n  ";
    const result = postProcessHtml(input);
    expect(result).toBe(result.trim());
  });
});
