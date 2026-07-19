import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

describe("[Browser] ElmShikiHighlighter", () => {
  it("runs the real grammar pipeline with dual-theme token properties", async () => {
    const rendered = render(() => (
      <ElmShikiHighlighter
        code="const answer: number = 42;"
        language="typescript"
      />
    ));

    await vi.waitFor(
      () => expect(rendered.container.querySelector(".shiki")).not.toBeNull(),
      { timeout: 15_000 },
    );
    const html = rendered.container.innerHTML;
    expect(
      rendered.container.querySelectorAll(".line span").length,
    ).toBeGreaterThan(1);
    expect(html).toContain("--shiki-light");
    expect(html).toContain("--shiki-dark");
  }, 20_000);

  it("renders an unknown language through the plaintext fallback", async () => {
    const rendered = render(() => (
      <ElmShikiHighlighter
        code="unknown language remains visible"
        language="not-a-real-language"
      />
    ));

    await vi.waitFor(
      () => expect(rendered.container.querySelector(".shiki")).not.toBeNull(),
      { timeout: 15_000 },
    );
    expect(rendered.container.textContent).toContain(
      "unknown language remains visible",
    );
  }, 20_000);
});
