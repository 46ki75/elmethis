import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmUnsupportedBlock } from "./elm-unsupported-block";

// ElmUnsupportedBlock is the static placeholder shown for blocks the renderer
// can't handle. It always shows the "UNSUPPORTED BLOCK" message + warning icon,
// and conditionally renders a `details` sub-line.

describe("[CSR] ElmUnsupportedBlock", () => {
  it("renders the UNSUPPORTED BLOCK message with the warning icon", () => {
    const wrapper = mount(ElmUnsupportedBlock);
    // VTU `find` matches the root element too (raw querySelector would not).
    expect(wrapper.find('[class*="elm-unsupported-block"]').exists()).toBe(
      true,
    );
    expect(wrapper.find("svg").exists()).toBe(true);
    expect(wrapper.html()).toContain("UNSUPPORTED BLOCK");
  });

  it("omits the details line when no details prop is given", () => {
    const wrapper = mount(ElmUnsupportedBlock);
    expect(wrapper.element.querySelector('[class*="details"]')).toBeFalsy();
  });

  it("renders the details line when details is supplied", () => {
    const wrapper = mount(ElmUnsupportedBlock, {
      props: { details: "type: mermaid" },
    });
    expect(wrapper.element.querySelector('[class*="details"]')).toBeTruthy();
    expect(wrapper.html()).toContain("type: mermaid");
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmUnsupportedBlock, {
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find("div").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmUnsupportedBlock", () => {
  it("server HTML emits the message, and details only when provided", async () => {
    const without = await renderToString(
      createSSRApp({ render: () => h(ElmUnsupportedBlock) }),
    );
    expect(without).toContain("UNSUPPORTED BLOCK");
    expect(without).not.toContain("type: mermaid");

    const withDetails = await renderToString(
      createSSRApp({
        render: () => h(ElmUnsupportedBlock, { details: "type: mermaid" }),
      }),
    );
    expect(withDetails).toContain("type: mermaid");
  });
});
