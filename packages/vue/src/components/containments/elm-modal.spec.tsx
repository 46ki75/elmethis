import { describe, expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmModal } from "./elm-modal";

// `<dialog>.showModal()` is exercised in a real browser, so the unit layer only
// covers the CLOSED state and state-independent markup. The open lifecycle
// (showModal, top layer, fade, close timer) is in elm-modal.browser.spec.tsx.

const body = (content: string) => ({ default: () => content });

describe("[CSR] ElmModal", () => {
  test("renders a closed dialog with content", () => {
    const wrapper = mount(ElmModal, {
      props: { isOpen: false },
      slots: body("Modal body"),
    });
    expect(wrapper.html()).toContain("Modal body");
    // Initially-closed modal never armed showModal(), so it carries no `shown`.
    expect(wrapper.find("dialog").classes()).not.toContain("shown");
  });

  test("renders a dialog element", () => {
    const wrapper = mount(ElmModal, { slots: body("Body") });
    expect(wrapper.find("dialog").exists()).toBe(true);
  });

  // The fade delay is emitted as a scoped custom property so the CSS transition
  // stays in lockstep with the JS close timer.
  test("emits the delay as a scoped custom property", () => {
    const wrapper = mount(ElmModal, {
      props: { delay: 500 },
      slots: body("Body"),
    });
    const dialog = wrapper.find("dialog").element as HTMLDialogElement;
    expect(dialog.style.getPropertyValue("--elmethis-scoped-modal-delay")).toBe(
      "500ms",
    );
  });

  test("defaults the delay to 200ms", () => {
    const wrapper = mount(ElmModal, { slots: body("Body") });
    const dialog = wrapper.find("dialog").element as HTMLDialogElement;
    expect(dialog.style.getPropertyValue("--elmethis-scoped-modal-delay")).toBe(
      "200ms",
    );
  });

  test("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmModal, {
      attrs: { class: "custom-class" },
      slots: body("Body"),
    });
    expect(wrapper.find("dialog").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmModal", () => {
  test("renders the dialog and content on the server", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ElmModal, { isOpen: false }, body("Modal body")),
      }),
    );
    expect(html).toContain("Modal body");
    expect(html).toContain("<dialog");
  });
});
