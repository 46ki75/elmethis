import { describe, expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmDotLoadingIcon } from "./elm-dot-loading-icon";

describe("[CSR] ElmDotLoadingIcon", () => {
  test("renders exactly three decorative (aria-hidden) dots", () => {
    const wrapper = mount(ElmDotLoadingIcon);
    const dots = wrapper.element.querySelectorAll('span[aria-hidden="true"]');
    expect(dots.length).toBe(3);
  });

  test("size prop is forwarded to the --elmethis-scoped-size var", () => {
    const wrapper = mount(ElmDotLoadingIcon, { props: { size: "2rem" } });
    const root = wrapper.find("span").element as HTMLElement;
    expect(root.style.getPropertyValue("--elmethis-scoped-size")).toBe("2rem");
  });

  test("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmDotLoadingIcon, {
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find("span").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmDotLoadingIcon", () => {
  test("renders three dots in the SSR shell", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(ElmDotLoadingIcon) }),
    );
    const matches = html.match(/aria-hidden="true"/g) ?? [];
    expect(matches.length).toBe(3);
  });
});
