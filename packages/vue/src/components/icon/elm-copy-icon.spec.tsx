import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { mdiClipboardOutline } from "@mdi/js";

import { ElmCopyIcon } from "./elm-copy-icon";

// ElmCopyIcon is a thin wrapper around useClipboard's CopyButton — clipboard
// behavior is covered by use-clipboard.spec. Here we only smoke-render and
// assert the copy affordance (the clipboard glyph) shows up.

describe("[CSR] ElmCopyIcon", () => {
  it("renders the clipboard copy affordance", () => {
    const wrapper = mount(ElmCopyIcon, { props: { content: "hello" } });
    const html = wrapper.html().toLowerCase();
    expect(html).toContain("<svg");
    expect(html).toContain(`d="${mdiClipboardOutline.toLowerCase()}"`);
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmCopyIcon, {
      props: { content: "hello" },
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find(".custom-class").exists()).toBe(true);
  });
});

describe("[SSR] ElmCopyIcon", () => {
  it("renders the clipboard glyph server-side", async () => {
    const html = (
      await renderToString(
        createSSRApp({ render: () => h(ElmCopyIcon, { content: "hello" }) }),
      )
    ).toLowerCase();
    expect(html).toContain("<svg");
    expect(html).toContain(`d="${mdiClipboardOutline.toLowerCase()}"`);
  });
});
