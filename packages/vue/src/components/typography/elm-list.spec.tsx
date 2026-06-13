import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmList } from "./elm-list";

describe("[CSR] ElmList", () => {
  // `listStyle` selects the list element: "ordered" → <ol>, "unordered" → <ul>.
  it("listStyle='ordered' renders an <ol>", () => {
    const wrapper = mount(ElmList, {
      props: { listStyle: "ordered" },
      slots: { default: () => h("li", "one") },
    });
    expect(wrapper.find("ol").exists()).toBe(true);
    expect(wrapper.find("ul").exists()).toBe(false);
    expect(wrapper.text()).toContain("one");
  });

  it("listStyle='unordered' renders a <ul>", () => {
    const wrapper = mount(ElmList, {
      props: { listStyle: "unordered" },
      slots: { default: () => h("li", "item") },
    });
    expect(wrapper.find("ul").exists()).toBe(true);
    expect(wrapper.find("ol").exists()).toBe(false);
    expect(wrapper.text()).toContain("item");
  });

  it("renders multiple list items from the children", () => {
    const wrapper = mount(ElmList, {
      props: { listStyle: "unordered" },
      slots: { default: () => [h("li", "alpha"), h("li", "beta")] },
    });
    expect(wrapper.text()).toContain("alpha");
    expect(wrapper.text()).toContain("beta");
  });

  // Nested lists are just lists in the children — both element types appear.
  it("supports nested lists", () => {
    const wrapper = mount(ElmList, {
      props: { listStyle: "unordered" },
      slots: {
        default: () =>
          h("li", [
            "parent",
            h(ElmList, { listStyle: "ordered" }, () => h("li", "child")),
          ]),
      },
    });
    expect(wrapper.find("ul").exists()).toBe(true);
    expect(wrapper.find("ol").exists()).toBe(true);
    expect(wrapper.text()).toContain("parent");
    expect(wrapper.text()).toContain("child");
  });

  it("ordered list forwards the native `type` attribute", () => {
    const wrapper = mount(ElmList, {
      props: { listStyle: "ordered" },
      attrs: { type: "a" },
      slots: { default: () => h("li", "x") },
    });
    expect(wrapper.find("ol").attributes("type")).toBe("a");
  });
});

describe("[SSR] ElmList", () => {
  it("renders an <ol> server-side", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () =>
            h(ElmList, { listStyle: "ordered" }, () => h("li", "ssr-item")),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<ol");
    expect(html).toContain("ssr-item");
  });

  it("renders a <ul> server-side", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () =>
            h(ElmList, { listStyle: "unordered" }, () => h("li", "ssr-item")),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<ul");
  });
});
