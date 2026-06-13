import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmTextField } from "./elm-text-field";

describe("[CSR] ElmTextField — rendering", () => {
  it("renders the label", () => {
    const wrapper = mount(ElmTextField, { props: { label: "Username" } });
    expect(wrapper.text()).toContain("Username");
  });

  it("placeholder is forwarded onto the input", () => {
    const wrapper = mount(ElmTextField, {
      props: { label: "Email", placeholder: "you@example.com" },
    });
    expect(wrapper.find("input").attributes("placeholder")).toBe(
      "you@example.com",
    );
  });

  it("a value renders as the input value", () => {
    const wrapper = mount(ElmTextField, {
      props: { label: "Name", value: "seed" },
    });
    expect((wrapper.find("input").element as HTMLInputElement).value).toBe(
      "seed",
    );
  });

  it("disabled forwards onto the input and applies the disabled class", () => {
    const wrapper = mount(ElmTextField, {
      props: { label: "Locked", disabled: true },
    });
    expect((wrapper.find("input").element as HTMLInputElement).disabled).toBe(
      true,
    );
    expect(wrapper.html()).toMatch(/disabled/);
  });

  it("required renders the marker and sets aria-required", () => {
    const wrapper = mount(ElmTextField, {
      props: { label: "Mandatory", required: true },
    });
    expect(wrapper.find("input").attributes("aria-required")).toBe("true");
    expect(wrapper.text()).toContain("*");
  });

  it("isPassword renders the input with type=password", () => {
    const wrapper = mount(ElmTextField, {
      props: { label: "Secret", isPassword: true },
    });
    expect(wrapper.find("input").attributes("type")).toBe("password");
  });

  it("renders a leading icon by default when no icon slot is provided", () => {
    const wrapper = mount(ElmTextField, { props: { label: "Text" } });
    expect(wrapper.find("svg").exists()).toBe(true);
  });

  it("renders a custom icon when the icon slot is provided", () => {
    const wrapper = mount(ElmTextField, {
      props: { label: "Text" },
      slots: { icon: () => h("span", { "data-testid": "custom-icon" }) },
    });
    expect(wrapper.find('[data-testid="custom-icon"]').exists()).toBe(true);
  });
});

describe("[CSR] ElmTextField — value binding", () => {
  it("typing into the input emits update:value with the new value", async () => {
    const wrapper = mount(ElmTextField, {
      props: { label: "Name", value: "" },
    });
    await wrapper.find("input").setValue("Ada");
    expect(wrapper.emitted("update:value")?.at(-1)).toEqual(["Ada"]);
  });

  it("typing updates a controlled parent value (v-model)", async () => {
    const Harness = defineComponent({
      setup() {
        const value = ref("");
        return () =>
          h("div", [
            h("output", { "data-testid": "value" }, value.value),
            h(ElmTextField, {
              label: "Name",
              value: value.value,
              "onUpdate:value": (v: string) => (value.value = v),
            }),
          ]);
      },
    });
    const wrapper = mount(Harness);
    await wrapper.find("input").setValue("Ada");
    expect(wrapper.get('[data-testid="value"]').text()).toBe("Ada");
  });

  it("renders a character counter when value is set (with maxLength)", () => {
    const wrapper = mount(ElmTextField, {
      props: { label: "Counted", value: "abc", maxLength: 10 },
    });
    expect(wrapper.text()).toContain("3 / 10");
  });

  it("does not render a character counter when value is omitted", () => {
    const wrapper = mount(ElmTextField, {
      props: { label: "None", maxLength: 10 },
    });
    expect(wrapper.text()).not.toContain("/ 10");
  });
});

describe("[SSR] ElmTextField", () => {
  it("renders the label and an input in the server shell", async () => {
    const html = (
      await renderToString(
        createSSRApp({ render: () => h(ElmTextField, { label: "SSR" }) }),
      )
    ).toLowerCase();
    expect(html).toContain("ssr");
    expect(html).toContain("<input");
  });
});
