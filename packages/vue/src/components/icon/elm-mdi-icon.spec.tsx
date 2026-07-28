import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { mdiCodeTags } from "@mdi/js";

import { ElmMdiIcon } from "./elm-mdi-icon";

describe("[CSR] ElmMdiIcon", () => {
  it("renders a decorative currentColor SVG with the given path", () => {
    const wrapper = mount(ElmMdiIcon, { props: { path: mdiCodeTags } });
    const svg = wrapper.find("svg");
    expect(svg.attributes("aria-hidden")).toBe("true");
    expect(svg.attributes("role")).toBeUndefined();
    expect(svg.attributes("focusable")).toBe("false");
    expect(svg.attributes("fill")).toBe("currentColor");
    expect(wrapper.find("path").attributes("d")).toBe(mdiCodeTags);
  });

  it("exposes a labeled icon as an image", () => {
    const wrapper = mount(ElmMdiIcon, {
      props: { path: mdiCodeTags, label: "Code" },
    });
    const svg = wrapper.find("svg");
    expect(svg.attributes("role")).toBe("img");
    expect(svg.attributes("aria-hidden")).toBeUndefined();
    expect(wrapper.find("title").text()).toBe("Code");
  });

  it("size prop drives both width and height", () => {
    const wrapper = mount(ElmMdiIcon, {
      props: { path: mdiCodeTags, size: 32 },
    });
    const svg = wrapper.find("svg");
    expect(svg.attributes("width")).toBe("32");
    expect(svg.attributes("height")).toBe("32");
  });

  it("color prop sets the currentColor source", () => {
    const wrapper = mount(ElmMdiIcon, {
      props: {
        path: mdiCodeTags,
        color: "var(--elmethis-color-primary)",
      },
    });
    const svg = wrapper.find("svg");
    expect(svg.attributes("color")).toBe("var(--elmethis-color-primary)");
    expect(svg.attributes("fill")).toBe("currentColor");
  });

  it("uses native ARIA naming when provided", () => {
    const wrapper = mount(ElmMdiIcon, {
      props: { path: mdiCodeTags },
      attrs: { "aria-label": "Code" },
    });
    const svg = wrapper.find("svg");
    expect(svg.attributes("role")).toBe("img");
    expect(svg.attributes("aria-hidden")).toBeUndefined();
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmMdiIcon, {
      props: { path: mdiCodeTags },
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find("svg").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmMdiIcon", () => {
  it("renders the labeled svg shell with the path", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () => h(ElmMdiIcon, { path: mdiCodeTags, label: "Code" }),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<svg");
    expect(html).toContain('role="img"');
    expect(html).toContain("<title>code</title>");
    expect(html).toContain(`d="${mdiCodeTags.toLowerCase()}"`);
  });
});
