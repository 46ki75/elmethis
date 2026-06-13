import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmCodeBlock } from "./elm-code-block";

// ElmCodeBlock composes a language icon + caption + copy affordance (the
// `useClipboard` hook) + ElmShikiHighlighter. The real clipboard round-trip is
// covered by use-clipboard.browser.spec.tsx and the highlight pipeline by
// elm-shiki-highlighter.spec.tsx — here we only assert the composition wiring:
// code is highlighted, the language label shows, and both the language and copy
// icons are present.

// Shiki's first highlight loads grammar + oniguruma WASM, which can exceed the
// 1s default under the concurrent three-package pre-commit `check`.
const HIGHLIGHT_WAIT = { timeout: 10_000 } as const;

describe("[CSR] ElmCodeBlock — composition", () => {
  it("highlights the code via the embedded shiki highlighter", async () => {
    const wrapper = mount(ElmCodeBlock, {
      props: { code: "let x = 1;", language: "rust" },
    });
    // Shiki highlights asynchronously inside ElmShikiHighlighter's effect.
    await vi.waitFor(
      () => expect(wrapper.html()).toContain("--shiki-light"),
      HIGHLIGHT_WAIT,
    );
    // Proof ElmShikiHighlighter ran inside the block.
    expect(wrapper.html()).toContain("shiki");
  });

  it("falls back to the language as the caption when none is given", () => {
    const wrapper = mount(ElmCodeBlock, {
      props: { code: "x", language: "rust" },
    });
    // `{caption || language}` -> the language label is shown.
    expect(wrapper.text()).toContain("rust");
  });

  it("an explicit caption overrides the language label", () => {
    const wrapper = mount(ElmCodeBlock, {
      props: { code: "x", language: "python", caption: "my-script.py" },
    });
    expect(wrapper.text()).toContain("my-script.py");
    // The bare language is no longer rendered as the caption text node.
    expect(wrapper.html()).not.toContain(">python<");
  });

  it("renders the language icon and the copy affordance (two SVGs)", () => {
    const wrapper = mount(ElmCodeBlock, {
      props: { code: "x", language: "typescript" },
    });
    // One <svg> for ElmLanguageIcon, one for the copy button's mdi icon.
    expect(wrapper.findAll("svg").length).toBeGreaterThanOrEqual(2);
    // The copy button carries the clipboard hook's host class (CSS Modules keep
    // the authored name as a substring).
    expect(wrapper.html()).toContain("use-clipboard");
  });

  it("forwards extra <figure> attributes onto the host", () => {
    const wrapper = mount(ElmCodeBlock, {
      props: { code: "x", language: "txt" },
      attrs: { "data-testid": "block" },
    });
    expect(wrapper.find("figure").attributes("data-testid")).toBe("block");
  });

  it("forwards a custom class onto the host", () => {
    const wrapper = mount(ElmCodeBlock, {
      props: { code: "x", language: "txt" },
      attrs: { class: "custom-root" },
    });
    expect(wrapper.find("figure").classes()).toContain("custom-root");
  });

  it("renders default-slot children alongside the caption", () => {
    const wrapper = mount(ElmCodeBlock, {
      props: { code: "x", language: "txt", caption: "cap" },
      slots: { default: () => "extra-slot-text" },
    });
    expect(wrapper.text()).toContain("extra-slot-text");
    expect(wrapper.text()).toContain("cap");
  });
});

describe("[SSR] ElmCodeBlock", () => {
  it("renders the host <figure> and caption server-side", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () =>
            h(ElmCodeBlock, {
              code: "let x = 1;",
              language: "rust",
              caption: "src/main.rs",
            }),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<figure");
    expect(html).toContain("src/main.rs");
  });
});
