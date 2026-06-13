import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmButton } from "./elm-button";

describe("[CSR] ElmButton — rendering & variants", () => {
  it("renders children inside a <button>", () => {
    const wrapper = mount(ElmButton, { slots: { default: () => "Click me" } });
    expect(wrapper.find("button").exists()).toBe(true);
    expect(wrapper.find("button").text()).toContain("Click me");
  });

  it("primary applies the primary variant class", () => {
    const wrapper = mount(ElmButton, {
      props: { primary: true },
      slots: { default: () => "Primary" },
    });
    expect(wrapper.find("button").classes().join(" ")).toMatch(/primary/);
  });

  it("default (no primary, no color) applies the normal variant class", () => {
    const wrapper = mount(ElmButton, { slots: { default: () => "Normal" } });
    expect(wrapper.find("button").classes().join(" ")).toMatch(/normal/);
  });

  it("isLoading renders the loading icon instead of children", () => {
    const wrapper = mount(ElmButton, {
      props: { isLoading: true },
      slots: { default: () => "Hidden" },
    });
    expect(wrapper.find('[class*="elm-dot-loading-icon"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Hidden");
  });

  it("disabled forwards the native attribute onto the <button>", () => {
    const wrapper = mount(ElmButton, {
      props: { disabled: true },
      slots: { default: () => "Nope" },
    });
    expect((wrapper.find("button").element as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("color flows into the scoped CSS custom property", () => {
    const wrapper = mount(ElmButton, {
      props: { color: "red" },
      slots: { default: () => "x" },
    });
    const button = wrapper.find("button").element as HTMLElement;
    expect(button.style.getPropertyValue("--elmethis-scoped-color")).toBe(
      "red",
    );
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmButton, {
      attrs: { class: "custom-class" },
      slots: { default: () => "x" },
    });
    expect(wrapper.find("button").classes()).toContain("custom-class");
  });
});

describe("[CSR] ElmButton — onClick", () => {
  it("fires onClick when enabled", async () => {
    const onClick = vi.fn();
    const wrapper = mount(ElmButton, {
      attrs: { onClick },
      slots: { default: () => "Go" },
    });
    await wrapper.find("button").trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    const wrapper = mount(ElmButton, {
      props: { disabled: true },
      attrs: { onClick },
      slots: { default: () => "Go" },
    });
    await wrapper.find("button").trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not fire onClick when isLoading", async () => {
    const onClick = vi.fn();
    const wrapper = mount(ElmButton, {
      props: { isLoading: true },
      attrs: { onClick },
      slots: { default: () => "Go" },
    });
    await wrapper.find("button").trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("[SSR] ElmButton", () => {
  it("renders children in the server shell", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () =>
            h(ElmButton, { primary: true }, { default: () => "Submit" }),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<button");
    expect(html).toContain("submit");
  });
});
