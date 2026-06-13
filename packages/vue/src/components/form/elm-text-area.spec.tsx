import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmTextArea } from "./elm-text-area";

describe("[CSR] ElmTextArea — rendering", () => {
  it("renders the label", () => {
    const wrapper = mount(ElmTextArea, { props: { label: "Bio" } });
    expect(wrapper.text()).toContain("Bio");
  });

  it("placeholder is forwarded onto the textarea", () => {
    const wrapper = mount(ElmTextArea, {
      props: { label: "Notes", placeholder: "Type here" },
    });
    expect(wrapper.find("textarea").attributes("placeholder")).toBe(
      "Type here",
    );
  });

  it("rows defaults to 3 and honors the prop", async () => {
    const wrapper = mount(ElmTextArea, { props: { label: "Sized" } });
    expect(wrapper.find("textarea").attributes("rows")).toBe("3");
    await wrapper.setProps({ rows: 6 });
    expect(wrapper.find("textarea").attributes("rows")).toBe("6");
  });

  it("a controlled value renders as the textarea value", () => {
    const wrapper = mount(ElmTextArea, {
      props: { label: "Body", value: "seed text" },
    });
    expect(
      (wrapper.find("textarea").element as HTMLTextAreaElement).value,
    ).toBe("seed text");
  });

  it("disabled forwards onto the textarea and applies the disabled class", () => {
    const wrapper = mount(ElmTextArea, {
      props: { label: "Locked", disabled: true },
    });
    expect(
      (wrapper.find("textarea").element as HTMLTextAreaElement).disabled,
    ).toBe(true);
    expect(wrapper.find("label").classes().join(" ")).toMatch(/disabled/);
  });

  it("isLoading disables the textarea", () => {
    const wrapper = mount(ElmTextArea, {
      props: { label: "Busy", isLoading: true },
    });
    expect(
      (wrapper.find("textarea").element as HTMLTextAreaElement).disabled,
    ).toBe(true);
  });

  it("required sets aria-required and renders the marker", () => {
    const wrapper = mount(ElmTextArea, {
      props: { label: "Mandatory", required: true },
    });
    expect(wrapper.find("textarea").attributes("aria-required")).toBe("true");
    expect(wrapper.text()).toContain("*");
  });

  it("renders a custom icon when provided instead of the default", () => {
    const wrapper = mount(ElmTextArea, {
      props: { label: "Iconed" },
      slots: { icon: () => h("span", { "data-testid": "custom-icon" }) },
    });
    expect(wrapper.find('[data-testid="custom-icon"]').exists()).toBe(true);
  });
});

describe("[CSR] ElmTextArea — value & counter", () => {
  it("emits update:value when the user types", async () => {
    const wrapper = mount(ElmTextArea, {
      props: { label: "Body", defaultValue: "" },
    });
    await wrapper.find("textarea").setValue("hello");
    expect(wrapper.emitted("update:value")?.at(-1)).toEqual(["hello"]);
  });

  it("renders a character counter (with maxLength) for a controlled value", () => {
    const wrapper = mount(ElmTextArea, {
      props: { label: "Counted", value: "abcd", maxLength: 20 },
    });
    expect(wrapper.text()).toContain("4 / 20");
  });

  it("counter tracks typed input for an uncontrolled value", async () => {
    const wrapper = mount(ElmTextArea, {
      props: { label: "Counted", defaultValue: "", maxLength: 20 },
    });
    expect(wrapper.text()).toContain("0 / 20");
    await wrapper.find("textarea").setValue("hello");
    expect(wrapper.text()).toContain("5 / 20");
  });

  it("omits the counter when neither value nor defaultValue is provided", () => {
    const wrapper = mount(ElmTextArea, {
      props: { label: "Plain", maxLength: 10 },
    });
    expect(wrapper.text()).not.toContain("/ 10");
  });
});

describe("[SSR] ElmTextArea", () => {
  it("renders the label and a textarea server-side", async () => {
    const html = (
      await renderToString(
        createSSRApp({ render: () => h(ElmTextArea, { label: "SSR" }) }),
      )
    ).toLowerCase();
    expect(html).toContain("ssr");
    expect(html).toContain("<textarea");
  });
});
