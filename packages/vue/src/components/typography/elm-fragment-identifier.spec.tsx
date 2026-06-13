import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmFragmentIdentifier } from "./elm-fragment-identifier";

describe("[CSR] ElmFragmentIdentifier", () => {
  it("renders a `#` marker span", () => {
    const wrapper = mount(ElmFragmentIdentifier, { props: { id: "intro" } });
    const span = wrapper.find("span");
    expect(span.exists()).toBe(true);
    expect(span.text()).toContain("#");
  });

  // The id drives click-to-hash behavior; it is captured in the handler rather
  // than reflected as a DOM attribute, so assert it renders without throwing.
  it("renders for an arbitrary id", () => {
    const wrapper = mount(ElmFragmentIdentifier, {
      props: { id: "some-section-2" },
    });
    expect(wrapper.find("span").text()).toContain("#");
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmFragmentIdentifier, {
      props: { id: "intro" },
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find("span").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmFragmentIdentifier", () => {
  it("renders the marker in the server shell", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () => h(ElmFragmentIdentifier, { id: "intro" }),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<span");
    expect(html).toContain("#");
  });
});
