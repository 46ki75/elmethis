import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const shiki = vi.hoisted(() => ({
  createHighlighter: vi.fn(),
}));

vi.mock("shiki", () => ({
  bundledLanguages: { rs: {}, rust: {}, ts: {}, typescript: {} },
  createHighlighter: shiki.createHighlighter,
}));
vi.mock("@46ki75/ikuma-theme/dark", () => ({
  default: { name: "ikuma-dark" },
}));
vi.mock("@46ki75/ikuma-theme/light", () => ({
  default: { name: "ikuma-light" },
}));

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

const highlighter = () => ({
  codeToHtml: vi.fn(
    (code: string) =>
      `<pre class="shiki"><code><span class="line" style="--shiki-light:#111;--shiki-dark:#eee">${code}</span></code></pre>`,
  ),
  dispose: vi.fn(),
});

describe("[CSR] ElmShikiHighlighter", () => {
  beforeEach(() => {
    shiki.createHighlighter.mockReset();
  });

  it("highlights after mount with dual themes and disposes the highlighter", async () => {
    const instance = highlighter();
    shiki.createHighlighter.mockResolvedValue(instance);
    const rendered = render(() => (
      <ElmShikiHighlighter
        code="let value = 1;"
        language="rust"
        class="custom"
        data-testid="source"
      />
    ));

    expect(rendered.getByTestId("source")).toHaveClass("custom");
    await vi.waitFor(() =>
      expect(rendered.container.innerHTML).toContain("--shiki-light"),
    );

    expect(shiki.createHighlighter).toHaveBeenCalledWith(
      expect.objectContaining({ langs: ["rust"] }),
    );
    expect(instance.codeToHtml).toHaveBeenCalledWith(
      "let value = 1;",
      expect.objectContaining({
        defaultColor: false,
        themes: expect.objectContaining({ dark: expect.anything() }),
      }),
    );
    expect(instance.dispose).toHaveBeenCalledOnce();
  });

  it("accepts bundled aliases and falls back to Shiki plaintext for unknown languages", async () => {
    const [language, setLanguage] = createSignal("rs");
    shiki.createHighlighter.mockImplementation(async () => highlighter());
    const rendered = render(() => (
      <ElmShikiHighlighter code="plain text" language={language()} />
    ));

    await vi.waitFor(() =>
      expect(shiki.createHighlighter).toHaveBeenCalledWith(
        expect.objectContaining({ langs: ["rs"] }),
      ),
    );

    setLanguage("not-a-language");
    await vi.waitFor(() =>
      expect(shiki.createHighlighter).toHaveBeenLastCalledWith(
        expect.objectContaining({ langs: [] }),
      ),
    );
    await vi.waitFor(() =>
      expect(rendered.container.innerHTML).toContain("plain text"),
    );
  });

  it("does not let an older generation overwrite a newer highlight", async () => {
    const pending: Array<(value: ReturnType<typeof highlighter>) => void> = [];
    shiki.createHighlighter.mockImplementation(
      () =>
        new Promise((resolve) => {
          pending.push(resolve);
        }),
    );
    const [code, setCode] = createSignal("old code");
    const rendered = render(() => (
      <ElmShikiHighlighter code={code()} language="rust" />
    ));

    await vi.waitFor(() => expect(pending).toHaveLength(1));
    setCode("new code");
    await vi.waitFor(() => expect(pending).toHaveLength(2));

    const newer = highlighter();
    pending[1](newer);
    await vi.waitFor(() =>
      expect(rendered.container.textContent).toContain("new code"),
    );

    const older = highlighter();
    pending[0](older);
    await vi.waitFor(() => expect(older.dispose).toHaveBeenCalledOnce());
    expect(rendered.container.textContent).toContain("new code");
    expect(rendered.container.textContent).not.toContain("old code");
  });

  it("disposes a highlighter that resolves after unmount without updating DOM", async () => {
    let resolve: ((value: ReturnType<typeof highlighter>) => void) | undefined;
    shiki.createHighlighter.mockImplementation(
      () =>
        new Promise((next) => {
          resolve = next;
        }),
    );
    const rendered = render(() => (
      <ElmShikiHighlighter code="late code" language="rust" />
    ));

    await vi.waitFor(() => expect(resolve).toBeTypeOf("function"));
    rendered.unmount();
    const late = highlighter();
    resolve!(late);

    await vi.waitFor(() => expect(late.dispose).toHaveBeenCalledOnce());
    expect(rendered.container.innerHTML).toBe("");
  });

  it("short-circuits empty code without creating a highlighter", async () => {
    const rendered = render(() => <ElmShikiHighlighter code="" />);

    await Promise.resolve();
    expect(rendered.container.querySelector("pre")).not.toBeNull();
    expect(rendered.container.querySelector("pre")).toBeEmptyDOMElement();
    expect(shiki.createHighlighter).not.toHaveBeenCalled();
  });
});
