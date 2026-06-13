import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmValidation } from "./elm-validation";

describe("[CSR] ElmValidation", () => {
  it("renders the validation text and an icon", () => {
    const wrapper = mount(ElmValidation, {
      props: { text: "Must be 8+ chars", isValid: false },
    });
    expect(wrapper.text()).toContain("Must be 8+ chars");
    // ElmMdiIcon renders as an <svg>.
    expect(wrapper.find("svg").exists()).toBe(true);
  });

  it("invalid state dims the row via the scoped opacity variable", () => {
    const wrapper = mount(ElmValidation, {
      props: { text: "Pending", isValid: false },
    });
    const root = wrapper.element as HTMLElement;
    expect(root.style.getPropertyValue("--elmethis-scoped-opacity")).toBe(
      "0.5",
    );
  });

  it("valid state renders at full opacity", () => {
    const wrapper = mount(ElmValidation, {
      props: { text: "Looks good", isValid: true },
    });
    const root = wrapper.element as HTMLElement;
    expect(root.style.getPropertyValue("--elmethis-scoped-opacity")).toBe("1");
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmValidation, {
      props: { text: "x", isValid: true },
      attrs: { class: "custom-class" },
    });
    expect(wrapper.classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmValidation", () => {
  it("renders the text in the server shell", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ElmValidation, { text: "Server-checked", isValid: true }),
      }),
    );
    expect(html).toContain("Server-checked");
  });
});
