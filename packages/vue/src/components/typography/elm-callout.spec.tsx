import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmCallout, type AlertType } from "./elm-callout";

const TYPES: AlertType[] = ["note", "tip", "important", "warning", "caution"];

describe("[CSR] ElmCallout", () => {
  it("renders children inside an <aside>", () => {
    const wrapper = mount(ElmCallout, {
      slots: { default: () => "callout body" },
    });
    expect(wrapper.find("aside").exists()).toBe(true);
    expect(wrapper.text()).toContain("callout body");
  });

  it("defaults to the 'note' type", () => {
    const wrapper = mount(ElmCallout, { slots: { default: () => "x" } });
    expect(wrapper.find("aside").text()).toContain("note");
  });

  // Each variant renders its name in the header and a distinct icon <svg>.
  for (const type of TYPES) {
    it(`type='${type}' labels the header and renders an icon`, () => {
      const wrapper = mount(ElmCallout, {
        props: { type },
        slots: { default: () => "x" },
      });
      expect(wrapper.find("aside").text()).toContain(type);
      expect(wrapper.find("svg").exists()).toBe(true);
    });
  }

  // The variant icons are distinct paths — confirm two different types produce
  // different markup so the ICON_MAP lookup is actually exercised.
  it("different types render different icon paths", () => {
    const pathOf = (type: AlertType) => {
      const wrapper = mount(ElmCallout, {
        props: { type },
        slots: { default: () => "x" },
      });
      return wrapper.find("path").attributes("d") ?? "";
    };
    expect(pathOf("note")).not.toBe("");
    expect(pathOf("note")).not.toBe(pathOf("warning"));
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmCallout, {
      attrs: { class: "custom-class" },
      slots: { default: () => "x" },
    });
    expect(wrapper.find("aside").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmCallout", () => {
  it("renders the aside, label and body server-side", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () =>
            h(ElmCallout, { type: "tip" }, { default: () => "ssr-callout" }),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<aside");
    expect(html).toContain("tip");
    expect(html).toContain("ssr-callout");
  });
});
