import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmToggle } from "./elm-toggle";

// Click-driven toggling lives in elm-toggle.browser.spec.tsx. The unit layer
// covers render, summary slot, SSR, and the statically-derived `open` modifier
// for the uncontrolled defaultIsOpen path.

describe("[CSR] ElmToggle", () => {
  it("renders the string summary and slot content", () => {
    const wrapper = mount(ElmToggle, {
      props: { summary: "Summary text" },
      slots: { default: () => h("span", "Body content") },
    });
    expect(wrapper.text()).toContain("Summary text");
    expect(wrapper.text()).toContain("Body content");
  });

  // A non-string summary maps to the `summary` slot (qwik's named slot).
  it("renders a custom summary node via the summary slot", () => {
    const wrapper = mount(ElmToggle, {
      slots: {
        summary: () => h("span", "Slotted summary"),
        default: () => h("span", "Content"),
      },
    });
    expect(wrapper.text()).toContain("Slotted summary");
  });

  // Uncontrolled: the internal state seeds from `defaultIsOpen`, so the root
  // carries the `open` modifier at first render.
  it("carries the open modifier when defaultIsOpen is true", () => {
    const wrapper = mount(ElmToggle, {
      props: { summary: "S", defaultIsOpen: true },
      slots: { default: () => h("span", "Content") },
    });
    expect(wrapper.find("[class*='elm-toggle']").classes().join(" ")).toContain(
      "open",
    );
  });

  it("does not carry the open modifier when closed by default", () => {
    const wrapper = mount(ElmToggle, {
      props: { summary: "S" },
      slots: { default: () => h("span", "Content") },
    });
    expect(
      wrapper.find("[class*='elm-toggle']").classes().join(" "),
    ).not.toContain("open");
  });

  // Controlled: the root reflects the parent-owned `isOpen` value.
  it("reflects the controlled isOpen value", () => {
    const wrapper = mount(ElmToggle, {
      props: { summary: "S", isOpen: true },
      slots: { default: () => h("span", "Content") },
    });
    expect(wrapper.find("[class*='elm-toggle']").classes().join(" ")).toContain(
      "open",
    );
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmToggle, {
      props: { summary: "S" },
      attrs: { class: "custom-class" },
      slots: { default: () => h("span", "Content") },
    });
    expect(wrapper.find("[class*='elm-toggle']").classes()).toContain(
      "custom-class",
    );
  });
});

describe("[SSR] ElmToggle", () => {
  it("renders summary and content on the server", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            ElmToggle,
            { summary: "Summary text" },
            { default: () => h("span", "Body content") },
          ),
      }),
    );
    expect(html).toContain("Summary text");
    expect(html).toContain("Body content");
  });
});
