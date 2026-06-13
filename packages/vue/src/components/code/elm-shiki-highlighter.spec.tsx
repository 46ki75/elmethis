import { describe, expect, test, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

// Shiki highlights asynchronously inside a watcher (`codeToHtml`), injecting the
// markup via `innerHTML` (Vue's v-html). Vue Test Utils doesn't await the async
// watcher, so we `vi.waitFor` the highlighted markup to settle. The component
// requests `defaultColor: false`, so each token carries `--shiki-light*` /
// `--shiki-dark*` custom properties (resolved natively with light-dark() in
// CSS); asserting those proves the real highlight pipeline ran.
//
// The first highlight loads shiki's grammar + oniguruma WASM, which can exceed
// the 1s default when the three packages' suites run concurrently (pre-commit
// `check`), so the highlight waits use a generous explicit timeout.
const HIGHLIGHT_TIMEOUT = { timeout: 10_000 };

describe("[CSR] ElmShikiHighlighter — highlighted output", () => {
  test("emits shiki token markup with dual-theme custom properties", async () => {
    const wrapper = mount(ElmShikiHighlighter, {
      props: { code: "let x = 1;", language: "rust" },
    });
    await vi.waitFor(
      () => expect(wrapper.html()).toContain('class="line"'),
      HIGHLIGHT_TIMEOUT,
    );
    const html = wrapper.html();
    expect(html).toContain("shiki");
    expect(html).toContain('class="line"');
    // defaultColor:false emits BOTH theme variables per token, never a single
    // inlined color — this is what the module CSS resolves with light-dark().
    expect(html).toContain("--shiki-light");
    expect(html).toContain("--shiki-dark");
  });

  test("tokenizes the source into more than one span (real grammar applied)", async () => {
    const wrapper = mount(ElmShikiHighlighter, {
      props: { code: "const a = 1", language: "typescript" },
    });
    await vi.waitFor(
      () => expect(wrapper.html()).toContain("<span"),
      HIGHLIGHT_TIMEOUT,
    );
    const spanCount = (wrapper.html().match(/<span/g) ?? []).length;
    expect(spanCount).toBeGreaterThan(1);
  });

  test("empty code short-circuits before highlighting (no shiki markup)", () => {
    const wrapper = mount(ElmShikiHighlighter, { props: { code: "" } });
    // `if (!code) return` keeps rawHtml empty, so no inner shiki <pre>.
    expect(wrapper.find("pre").exists()).toBe(true);
    expect(wrapper.html()).not.toContain("shiki shiki-themes");
  });

  test("an unknown language degrades gracefully (still produces markup)", async () => {
    const wrapper = mount(ElmShikiHighlighter, {
      props: { code: "plain text here", language: "not-a-real-language" },
    });
    // shiki falls back to a plaintext grammar instead of throwing.
    await vi.waitFor(
      () => expect(wrapper.html()).toContain("plain text here"),
      HIGHLIGHT_TIMEOUT,
    );
    expect(wrapper.html()).toContain("shiki");
  });

  test("forwards extra <pre> attributes onto the host", () => {
    const wrapper = mount(ElmShikiHighlighter, {
      props: { code: "x", language: "txt" },
      attrs: { "data-testid": "highlighter" },
    });
    expect(wrapper.find("pre").attributes("data-testid")).toBe("highlighter");
  });
});

describe("[SSR] ElmShikiHighlighter", () => {
  test("renders the host <pre> server-side (highlight is client-only)", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () =>
            h(ElmShikiHighlighter, { code: "let x = 1;", language: "rust" }),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<pre");
  });
});
