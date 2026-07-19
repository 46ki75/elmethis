import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";

const runtime = vi.hoisted(() => ({
  codeToHtml: vi.fn(async (code: string) => `<pre class="shiki">${code}</pre>`),
  shikiLoads: 0,
  darkThemeLoads: 0,
  lightThemeLoads: 0,
}));

vi.mock("shiki", () => {
  runtime.shikiLoads += 1;
  return {
    bundledLanguages: { rust: {} },
    codeToHtml: runtime.codeToHtml,
  };
});
vi.mock("@46ki75/ikuma-theme/dark", () => {
  runtime.darkThemeLoads += 1;
  return { default: { name: "ikuma-dark" } };
});
vi.mock("@46ki75/ikuma-theme/light", () => {
  runtime.lightThemeLoads += 1;
  return { default: { name: "ikuma-light" } };
});

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

describe("[CSR] ElmShikiHighlighter deferred runtime", () => {
  it("loads Shiki and both themes once only when non-empty code needs highlighting", async () => {
    const empty = render(() => <ElmShikiHighlighter code="" />);

    await Promise.resolve();
    expect(runtime.shikiLoads).toBe(0);
    expect(runtime.darkThemeLoads).toBe(0);
    expect(runtime.lightThemeLoads).toBe(0);
    empty.unmount();

    const first = render(() => (
      <ElmShikiHighlighter code="first" language="rust" />
    ));
    await vi.waitFor(() =>
      expect(first.container.querySelector(".shiki")).not.toBeNull(),
    );
    expect(runtime.shikiLoads).toBe(1);
    expect(runtime.darkThemeLoads).toBe(1);
    expect(runtime.lightThemeLoads).toBe(1);

    const second = render(() => (
      <ElmShikiHighlighter code="second" language="rust" />
    ));
    await vi.waitFor(() =>
      expect(second.container.querySelector(".shiki")).not.toBeNull(),
    );
    expect(runtime.shikiLoads).toBe(1);
    expect(runtime.darkThemeLoads).toBe(1);
    expect(runtime.lightThemeLoads).toBe(1);
  });
});
