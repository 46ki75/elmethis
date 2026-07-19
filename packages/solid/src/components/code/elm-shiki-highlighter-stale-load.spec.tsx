import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

const shiki = vi.hoisted(() => ({
  createHighlighter: vi.fn(),
  releaseRuntime: undefined as (() => void) | undefined,
}));

vi.mock("shiki", async () => {
  await new Promise<void>((resolve) => {
    shiki.releaseRuntime = resolve;
  });

  return {
    bundledLanguages: { rust: {} },
    createHighlighter: shiki.createHighlighter,
  };
});
vi.mock("@46ki75/ikuma-theme/dark", () => ({ default: {} }));
vi.mock("@46ki75/ikuma-theme/light", () => ({ default: {} }));

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

describe("[CSR] ElmShikiHighlighter runtime loading", () => {
  it("does not initialize a highlighter for work that became stale while loading Shiki", async () => {
    shiki.createHighlighter.mockImplementation(async () => ({
      codeToHtml: (code: string) => `<pre>${code}</pre>`,
      dispose: vi.fn(),
    }));
    const [code, setCode] = createSignal("old code");
    const rendered = render(() => (
      <ElmShikiHighlighter code={code()} language="rust" />
    ));

    await vi.waitFor(() => expect(shiki.releaseRuntime).toBeTypeOf("function"));
    setCode("new code");
    await Promise.resolve();
    shiki.releaseRuntime!();

    await vi.waitFor(() =>
      expect(rendered.container.textContent).toContain("new code"),
    );
    await vi.waitFor(() =>
      expect(shiki.createHighlighter).toHaveBeenCalledOnce(),
    );
  });
});
