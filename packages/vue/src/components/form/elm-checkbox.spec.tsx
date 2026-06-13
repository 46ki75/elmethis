import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmCheckbox } from "./elm-checkbox";
import styles from "./elm-checkbox.module.css";

// The checkbox renders a `<polyline>` (the check mark) only while checked, so
// its presence is the rendered signal of the checked state.
const isChecked = (wrapper: {
  find: (s: string) => { exists: () => boolean };
}) => wrapper.find("polyline").exists();

describe("[CSR] ElmCheckbox — rendering", () => {
  it("renders the label", () => {
    const wrapper = mount(ElmCheckbox, { props: { label: "Accept terms" } });
    expect(wrapper.text()).toContain("Accept terms");
  });

  it("unchecked by default (no check mark)", () => {
    const wrapper = mount(ElmCheckbox, { props: { label: "Off" } });
    expect(isChecked(wrapper)).toBe(false);
  });

  it("defaultChecked renders in the checked state when uncontrolled", () => {
    const wrapper = mount(ElmCheckbox, {
      props: { label: "On", defaultChecked: true },
    });
    expect(isChecked(wrapper)).toBe(true);
  });

  it("disabled applies the disabled class", () => {
    const wrapper = mount(ElmCheckbox, {
      props: { label: "Disabled", disabled: true },
    });
    expect(wrapper.classes()).toContain(styles.disabled);
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmCheckbox, {
      props: { label: "x" },
      attrs: { class: "custom-class" },
    });
    expect(wrapper.classes()).toContain("custom-class");
  });
});

describe("[CSR] ElmCheckbox — toggle behavior", () => {
  it("clicking toggles the uncontrolled checked state", async () => {
    const wrapper = mount(ElmCheckbox, { props: { label: "Toggle me" } });
    expect(isChecked(wrapper)).toBe(false);

    await wrapper.trigger("click");

    expect(isChecked(wrapper)).toBe(true);
  });

  it("clicking emits update:checked for a v-model binding", async () => {
    const wrapper = mount(ElmCheckbox, {
      props: { label: "Bound", checked: false },
    });

    await wrapper.trigger("click");

    expect(wrapper.emitted("update:checked")).toEqual([[true]]);
  });

  it("controlled value follows the bound prop (v-model round trip)", async () => {
    const Harness = defineComponent({
      setup() {
        const checked = ref(false);
        return () =>
          h("div", [
            h("output", String(checked.value)),
            h(ElmCheckbox, {
              label: "Bound",
              checked: checked.value,
              "onUpdate:checked": (v: boolean) => (checked.value = v),
            }),
          ]);
      },
    });

    const wrapper = mount(Harness);
    expect(wrapper.find("output").text()).toBe("false");

    await wrapper.find(`.${styles["elm-checkbox"]}`).trigger("click");

    expect(wrapper.find("output").text()).toBe("true");
    expect(wrapper.find("polyline").exists()).toBe(true);
  });

  it("does not toggle when disabled", async () => {
    const wrapper = mount(ElmCheckbox, {
      props: { label: "Disabled", disabled: true },
    });

    await wrapper.trigger("click");

    expect(isChecked(wrapper)).toBe(false);
    expect(wrapper.emitted("update:checked")).toBeUndefined();
  });

  it("does not toggle when isLoading", async () => {
    const wrapper = mount(ElmCheckbox, {
      props: { label: "Loading", isLoading: true },
    });

    await wrapper.trigger("click");

    expect(isChecked(wrapper)).toBe(false);
    expect(wrapper.emitted("update:checked")).toBeUndefined();
  });
});

describe("[SSR] ElmCheckbox", () => {
  it("renders the label in the server shell", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(ElmCheckbox, { label: "SSR" }) }),
    );
    expect(html).toContain("SSR");
  });

  it("defaultChecked renders the check mark server-side", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ElmCheckbox, { label: "SSR", defaultChecked: true }),
      }),
    );
    expect(html).toContain("<polyline");
  });
});
