import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { mdiClipboardOutline } from "@mdi/js";

import { useClipboard } from "./use-clipboard";

// The real clipboard write + copied-state round-trip lives in the browser spec
// (it needs a real `navigator.clipboard` + permissions, and the auto-reset is
// owned by @vueuse). The unit layer covers the rendered CopyButton shell.

const Probe = defineComponent({
  name: "Probe",
  setup() {
    const { CopyButton } = useClipboard({ content: "hello", delay: 1500 });
    return () => h(CopyButton);
  },
});

describe("[CSR] useClipboard", () => {
  it("renders a CopyButton showing the outline (not-copied) icon", () => {
    const wrapper = mount(Probe);
    expect(wrapper.find("span").exists()).toBe(true);
    const path = wrapper.find("path");
    expect(path.exists()).toBe(true);
    // Idle state renders the plain clipboard outline.
    expect(path.attributes("d")).toBe(mdiClipboardOutline);
  });
});

describe("[SSR] useClipboard", () => {
  it("renders the copy button server-side", async () => {
    const html = (
      await renderToString(createSSRApp({ render: () => h(Probe) }))
    ).toLowerCase();
    expect(html).toContain("<span");
    expect(html).toContain("<svg");
  });
});
