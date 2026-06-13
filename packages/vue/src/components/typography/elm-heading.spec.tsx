import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmHeading } from "./elm-heading";

const LEVELS = [1, 2, 3, 4, 5, 6] as const;

describe("[CSR] ElmHeading", () => {
  // `level` maps directly onto the `h{level}` tag — exercise every level.
  for (const level of LEVELS) {
    it(`level=${level} renders <h${level}>`, () => {
      const wrapper = mount(ElmHeading, {
        props: { level, text: `heading-${level}` },
      });
      expect(wrapper.find(`h${level}`).exists()).toBe(true);
      expect(wrapper.text()).toContain(`heading-${level}`);
    });
  }

  it("text prop renders inside the heading", () => {
    const wrapper = mount(ElmHeading, { props: { level: 1, text: "Title" } });
    expect(wrapper.text()).toContain("Title");
  });

  it("children render alongside text", () => {
    const wrapper = mount(ElmHeading, {
      props: { level: 3 },
      slots: { default: () => h("span", "slotted") },
    });
    expect(wrapper.text()).toContain("slotted");
  });

  // The fragment-identifier anchor is only emitted when an `id` is supplied.
  it("with id: forwards id and renders the fragment-identifier anchor", () => {
    const wrapper = mount(ElmHeading, {
      props: { level: 2, id: "section-a", text: "Section A" },
    });
    expect(wrapper.attributes("id")).toBe("section-a");
    // ElmFragmentIdentifier renders a literal `#`.
    expect(wrapper.text()).toContain("#");
  });

  it("without id: no id attribute", () => {
    const wrapper = mount(ElmHeading, {
      props: { level: 2, text: "No anchor" },
    });
    expect(wrapper.attributes("id")).toBeUndefined();
  });

  it("level=2 emits the decorative underline span", () => {
    const wrapper = mount(ElmHeading, {
      props: { level: 2, text: "Underlined" },
    });
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true);
  });

  it("scoped font-size custom property reflects the level", () => {
    const wrapper = mount(ElmHeading, { props: { level: 1, text: "x" } });
    const heading = wrapper.element as HTMLElement;
    expect(heading.style.getPropertyValue("--elmethis-scoped-font-size")).toBe(
      "1.5em",
    );
  });
});

describe("[SSR] ElmHeading", () => {
  it("renders the correct heading tag and text server-side", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () => h(ElmHeading, { level: 4, text: "ssr-heading" }),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<h4");
    expect(html).toContain("ssr-heading");
  });

  it("emits id server-side", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () => h(ElmHeading, { level: 1, id: "ssr-id", text: "x" }),
        }),
      )
    ).toLowerCase();
    expect(html).toContain('id="ssr-id"');
  });
});
