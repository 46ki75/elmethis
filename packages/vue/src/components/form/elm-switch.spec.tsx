import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmSwitch } from "./elm-switch";
import styles from "./elm-switch.module.css";

// `checked` is a required controlled prop, so every case wraps the switch in a
// harness that owns the state (v-model:checked) and mirrors it for assertions.
const Harness = defineComponent({
  name: "Harness",
  props: {
    initial: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const checked = ref(props.initial);
    return () =>
      h("div", [
        h("output", { "data-testid": "state" }, String(checked.value)),
        h(ElmSwitch, {
          checked: checked.value,
          disabled: props.disabled,
          "onUpdate:checked": (v: boolean) => (checked.value = v),
        }),
      ]);
  },
});

describe("[CSR] ElmSwitch — rendering", () => {
  it("renders a checkbox input reflecting the bound value (off)", () => {
    const wrapper = mount(Harness);
    const input = wrapper.find("input").element as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it("renders checked when the bound state starts true", () => {
    const wrapper = mount(Harness, { props: { initial: true } });
    const input = wrapper.find("input").element as HTMLInputElement;
    expect(input.checked).toBe(true);
    expect(wrapper.find(`.${styles.bar}`).classes()).toContain(styles.checked);
  });

  it("disabled forwards onto the input and applies the disabled class", () => {
    const wrapper = mount(Harness, { props: { disabled: true } });
    const input = wrapper.find("input").element as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(wrapper.find(`.${styles.bar}`).classes()).toContain(styles.disabled);
  });
});

describe("[CSR] ElmSwitch — toggle behavior", () => {
  it("clicking toggles the bound state", async () => {
    const wrapper = mount(Harness);
    expect(wrapper.get('[data-testid="state"]').text()).toBe("false");

    await wrapper.find("input").trigger("click");

    expect(wrapper.get('[data-testid="state"]').text()).toBe("true");
  });

  it("does not toggle when disabled", async () => {
    const wrapper = mount(Harness, { props: { disabled: true } });

    await wrapper.find("input").trigger("click");

    expect(wrapper.get('[data-testid="state"]').text()).toBe("false");
  });
});

describe("[SSR] ElmSwitch", () => {
  it("renders a checkbox input in the server shell", async () => {
    const html = (
      await renderToString(
        createSSRApp({ render: () => h(Harness, { initial: true }) }),
      )
    ).toLowerCase();
    expect(html).toContain('type="checkbox"');
  });
});
