import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmBreadcrumb } from "./elm-breadcrumb";

// ElmBreadcrumb renders one `link-container` per item plus a chevron separator
// between items (n items -> n-1 chevrons). The first item gets the home icon,
// the last the application-outline icon, the rest folder-open. Item clicks are
// wired to each link's `onClick`.

describe("[CSR] ElmBreadcrumb — structure", () => {
  it("renders one item per link with their text", () => {
    const wrapper = mount(ElmBreadcrumb, {
      props: {
        links: [{ text: "Home" }, { text: "Docs" }, { text: "Page" }],
      },
    });

    expect(wrapper.findAll('[class*="link-container"]').length).toBe(3);
    expect(wrapper.text()).toContain("Home");
    expect(wrapper.text()).toContain("Docs");
    expect(wrapper.text()).toContain("Page");
  });

  it("renders n-1 chevron separators between items", () => {
    const wrapper = mount(ElmBreadcrumb, {
      props: { links: [{ text: "a" }, { text: "b" }, { text: "c" }] },
    });

    // The chevron carries its own class; three items yield two separators.
    expect(wrapper.findAll('[class*="chevron"]').length).toBe(2);
  });

  it("a single link renders no separator", () => {
    const wrapper = mount(ElmBreadcrumb, {
      props: { links: [{ text: "only" }] },
    });

    expect(wrapper.findAll('[class*="link-container"]').length).toBe(1);
    expect(wrapper.findAll('[class*="chevron"]').length).toBe(0);
  });

  it("merges a passthrough class onto the root nav", () => {
    const wrapper = mount(ElmBreadcrumb, {
      props: { links: [{ text: "Home" }] },
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find("nav").classes()).toContain("custom-class");
  });
});

describe("[CSR] ElmBreadcrumb — interaction", () => {
  it("clicking an item fires its onClick handler", async () => {
    const onClick = vi.fn();
    const wrapper = mount(ElmBreadcrumb, {
      props: { links: [{ text: "Home" }, { text: "Page", onClick }] },
    });

    const items = wrapper.findAll('[class*="link-container"]');
    await items[1].trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("[SSR] ElmBreadcrumb", () => {
  it("server HTML renders the nav with every item's text", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ElmBreadcrumb, {
            links: [{ text: "Home" }, { text: "Page" }],
          }),
      }),
    );
    expect(html.toLowerCase()).toContain("<nav");
    expect(html).toContain("Home");
    expect(html).toContain("Page");
  });
});
