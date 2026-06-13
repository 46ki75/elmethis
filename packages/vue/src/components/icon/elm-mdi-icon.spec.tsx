import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { mdiCodeTags } from "@mdi/js";

import { ElmMdiIcon } from "./elm-mdi-icon";

describe("[CSR] ElmMdiIcon", () => {
  it("renders an <svg role='img'> with the given path", () => {
    const wrapper = mount(ElmMdiIcon, { props: { d: mdiCodeTags } });
    const svg = wrapper.find("svg");
    expect(svg.exists()).toBe(true);
    expect(svg.attributes("role")).toBe("img");
    // The `d` prop must reach the inner <path>.
    expect(wrapper.find("path").attributes("d")).toBe(mdiCodeTags);
  });

  it("size prop drives both width and height", () => {
    const wrapper = mount(ElmMdiIcon, {
      props: { d: mdiCodeTags, size: "32px" },
    });
    const svg = wrapper.find("svg");
    expect(svg.attributes("width")).toBe("32px");
    expect(svg.attributes("height")).toBe("32px");
  });

  it("color prop feeds the svg fill and the scoped light color var", () => {
    const wrapper = mount(ElmMdiIcon, {
      props: { d: mdiCodeTags, color: "#ff0000" },
    });
    const svg = wrapper.find("svg").element as SVGElement;
    expect(svg.getAttribute("fill")).toBe("#ff0000");
    // Both --elmethis-scoped-color and --dark-color fall back to `color`.
    expect(svg.style.getPropertyValue("--elmethis-scoped-color")).toBe(
      "#ff0000",
    );
    expect(svg.style.getPropertyValue("--dark-color")).toBe("#ff0000");
  });

  it("lightColor / darkColor override the scoped color vars independently", () => {
    const wrapper = mount(ElmMdiIcon, {
      props: { d: mdiCodeTags, lightColor: "#111", darkColor: "#eee" },
    });
    const svg = wrapper.find("svg").element as SVGElement;
    expect(svg.style.getPropertyValue("--elmethis-scoped-color")).toBe("#111");
    expect(svg.style.getPropertyValue("--dark-color")).toBe("#eee");
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmMdiIcon, {
      props: { d: mdiCodeTags },
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find("svg").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmMdiIcon", () => {
  it("renders the svg shell with the path", async () => {
    const html = (
      await renderToString(
        createSSRApp({ render: () => h(ElmMdiIcon, { d: mdiCodeTags }) }),
      )
    ).toLowerCase();
    expect(html).toContain("<svg");
    expect(html).toContain('role="img"');
    expect(html).toContain(`d="${mdiCodeTags.toLowerCase()}"`);
  });
});
