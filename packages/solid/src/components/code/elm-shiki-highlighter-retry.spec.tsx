import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";

const shiki = vi.hoisted(() => ({
  codeToHtml: vi.fn(),
  loadAttempts: 0,
}));

vi.mock("shiki", () => {
  shiki.loadAttempts += 1;
  if (shiki.loadAttempts === 1) throw new Error("Failed to load Shiki");

  return {
    bundledLanguages: { rust: {} },
    codeToHtml: shiki.codeToHtml,
  };
});
vi.mock("@46ki75/ikuma-theme/dark", () => ({ default: {} }));
vi.mock("@46ki75/ikuma-theme/light", () => ({ default: {} }));

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

describe("[CSR] ElmShikiHighlighter runtime loading", () => {
  it("retries loading Shiki after an import failure", async () => {
    shiki.codeToHtml.mockResolvedValue('<pre class="shiki">highlighted</pre>');

    const first = render(() => (
      <ElmShikiHighlighter code="first" language="rust" />
    ));
    await vi.waitFor(() => expect(shiki.loadAttempts).toBe(1));
    first.unmount();

    const second = render(() => (
      <ElmShikiHighlighter code="second" language="rust" />
    ));
    await vi.waitFor(() => expect(shiki.loadAttempts).toBe(2));
    await vi.waitFor(() =>
      expect(second.container.innerHTML).toContain("highlighted"),
    );
  });
});
