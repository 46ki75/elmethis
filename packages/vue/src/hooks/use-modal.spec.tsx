import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { useModal } from "./use-modal";

// The open transition drives ElmModal into `dialog.showModal()`, which happy-dom
// cannot service — the native-dialog open lifecycle lives in the browser spec.
// These specs split into two halves that stay within happy-dom:
//   - state probe exercises show/hide/toggle WITHOUT mounting <Modal>
//   - structure probe mounts <Modal> but leaves it CLOSED

const StateProbe = defineComponent({
  name: "StateProbe",
  setup() {
    const { isOpen, show, hide, toggle } = useModal({ delay: 0 });
    return () =>
      h("div", [
        h("output", { class: "state" }, String(isOpen.value)),
        h("button", { class: "show", onClick: show }, "show"),
        h("button", { class: "hide", onClick: hide }, "hide"),
        h("button", { class: "toggle", onClick: toggle }, "toggle"),
      ]);
  },
});

const ModalProbe = defineComponent({
  name: "ModalProbe",
  setup() {
    const { Modal } = useModal({ delay: 0 });
    return () => h(Modal, null, { default: () => h("span", "Dialog Content") });
  },
});

describe("[CSR] useModal — state", () => {
  it("is closed by default", () => {
    const wrapper = mount(StateProbe);
    expect(wrapper.find(".state").text()).toBe("false");
  });

  it("show() opens, hide() closes", async () => {
    const wrapper = mount(StateProbe);

    await wrapper.find(".show").trigger("click");
    expect(wrapper.find(".state").text()).toBe("true");

    await wrapper.find(".hide").trigger("click");
    expect(wrapper.find(".state").text()).toBe("false");
  });

  it("toggle() flips isOpen each call", async () => {
    const wrapper = mount(StateProbe);

    await wrapper.find(".toggle").trigger("click");
    expect(wrapper.find(".state").text()).toBe("true");

    await wrapper.find(".toggle").trigger("click");
    expect(wrapper.find(".state").text()).toBe("false");
  });
});

describe("[CSR] useModal — structure", () => {
  it("renders the native <dialog> with content (kept closed)", () => {
    const wrapper = mount(ModalProbe);
    expect(wrapper.find("dialog").exists()).toBe(true);
    expect(wrapper.html()).toContain("Dialog Content");
  });
});

describe("[SSR] useModal", () => {
  it("renders the dialog shell with content", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(ModalProbe) }),
    );
    expect(html).toContain("<dialog");
    expect(html).toContain("Dialog Content");
  });
});
