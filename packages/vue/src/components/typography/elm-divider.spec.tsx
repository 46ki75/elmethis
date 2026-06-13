import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmDivider } from "./elm-divider";

describe("[CSR] ElmDivider", () => {
  it("renders an <hr>", () => {
    const wrapper = mount(ElmDivider);
    expect(wrapper.find("hr").exists()).toBe(true);
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmDivider, { attrs: { class: "custom-divider" } });
    expect(wrapper.find("hr").classes()).toContain("custom-divider");
  });
});

describe("[SSR] ElmDivider", () => {
  it("renders an <hr> server-side", async () => {
    const html = (await renderToString(createSSRApp(ElmDivider))).toLowerCase();
    expect(html).toContain("<hr");
  });
});
