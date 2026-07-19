import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const shiki = vi.hoisted(() => ({
  codeToHtml: vi.fn(),
  createHighlighter: vi.fn(),
}));

vi.mock("shiki", () => ({
  bundledLanguages: { rs: {}, rust: {}, ts: {}, typescript: {} },
  codeToHtml: shiki.codeToHtml,
  createHighlighter: shiki.createHighlighter,
}));
vi.mock("@46ki75/ikuma-theme/dark", () => ({
  default: { name: "ikuma-dark" },
}));
vi.mock("@46ki75/ikuma-theme/light", () => ({
  default: { name: "ikuma-light" },
}));

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

const highlighted = (code: string) =>
  `<pre class="shiki"><code><span class="line" style="--shiki-light:#111;--shiki-dark:#eee">${code}</span></code></pre>`;

describe("[CSR] ElmShikiHighlighter", () => {
  beforeEach(() => {
    shiki.codeToHtml.mockReset();
    shiki.createHighlighter.mockReset();
  });

  it("highlights after mount with dual themes through Shiki's cached shorthand", async () => {
    shiki.codeToHtml.mockImplementation(async (code: string) =>
      highlighted(code),
    );
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

    expect(shiki.codeToHtml).toHaveBeenCalledWith(
      "let value = 1;",
      expect.objectContaining({
        defaultColor: false,
        lang: "rust",
        themes: expect.objectContaining({ dark: expect.anything() }),
      }),
    );
    expect(shiki.createHighlighter).not.toHaveBeenCalled();
  });

  it("accepts bundled aliases and falls back to Shiki plaintext for unknown languages", async () => {
    const [language, setLanguage] = createSignal("rs");
    shiki.codeToHtml.mockImplementation(async (code: string) =>
      highlighted(code),
    );
    const rendered = render(() => (
      <ElmShikiHighlighter code="plain text" language={language()} />
    ));

    await vi.waitFor(() =>
      expect(shiki.codeToHtml).toHaveBeenCalledWith(
        "plain text",
        expect.objectContaining({ lang: "rs" }),
      ),
    );

    setLanguage("not-a-language");
    await vi.waitFor(() =>
      expect(shiki.codeToHtml).toHaveBeenLastCalledWith(
        "plain text",
        expect.objectContaining({ lang: "text" }),
      ),
    );
    await vi.waitFor(() =>
      expect(rendered.container.innerHTML).toContain("plain text"),
    );
  });

  it("does not let an older generation overwrite a newer highlight", async () => {
    const pending: Array<(value: string) => void> = [];
    shiki.codeToHtml.mockImplementation(
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

    pending[1](highlighted("new code"));
    await vi.waitFor(() =>
      expect(rendered.container.textContent).toContain("new code"),
    );

    pending[0](highlighted("old code"));
    await Promise.resolve();
    expect(rendered.container.textContent).toContain("new code");
    expect(rendered.container.textContent).not.toContain("old code");
  });

  it("ignores highlighting that resolves after unmount", async () => {
    let resolve: ((value: string) => void) | undefined;
    shiki.codeToHtml.mockImplementation(
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
    resolve!(highlighted("late code"));

    await Promise.resolve();
    expect(rendered.container.innerHTML).toBe("");
  });

  it("short-circuits empty code without invoking Shiki", async () => {
    const rendered = render(() => <ElmShikiHighlighter code="" />);

    await Promise.resolve();
    expect(rendered.container.querySelector("pre")).not.toBeNull();
    expect(rendered.container.querySelector("pre")).toBeEmptyDOMElement();
    expect(shiki.codeToHtml).not.toHaveBeenCalled();
    expect(shiki.createHighlighter).not.toHaveBeenCalled();
  });

  it("renders escaped source without nesting pre elements when highlighting fails", async () => {
    shiki.codeToHtml.mockRejectedValue(new Error("highlight failed"));
    const rendered = render(() => (
      <ElmShikiHighlighter code={'const value = "<safe> & readable";'} />
    ));

    await vi.waitFor(() =>
      expect(rendered.container.textContent).toContain("<safe> & readable"),
    );
    await vi.waitFor(() => expect(shiki.codeToHtml).toHaveBeenCalledOnce());
    expect(rendered.container.querySelectorAll("pre")).toHaveLength(1);
    expect(rendered.container.innerHTML).not.toContain("<safe>");
  });

  it("does not create a highlighter per code block", async () => {
    shiki.codeToHtml.mockImplementation(async (code: string) =>
      highlighted(code),
    );
    render(() => (
      <>
        <ElmShikiHighlighter code="first" language="rust" />
        <ElmShikiHighlighter code="second" language="typescript" />
      </>
    ));

    await vi.waitFor(() => expect(shiki.codeToHtml).toHaveBeenCalledTimes(2));
    expect(shiki.createHighlighter).not.toHaveBeenCalled();
  });
});
