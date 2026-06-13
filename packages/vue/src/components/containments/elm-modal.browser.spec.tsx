import { render } from "vitest-browser-vue";
import { describe, expect, test, vi } from "vitest";
import { defineComponent, ref } from "vue";

import { ElmModal } from "./elm-modal";

// The open lifecycle lives here because `<dialog>.showModal()` needs a real
// browser — only it has the top layer and native open state.
//
// An open `showModal()` dialog sits in the top layer and blocks pointer events
// to everything behind it, so every close control is placed INSIDE the dialog
// (or triggered programmatically). The open button is outside, clicked only
// while closed.
const Harness = defineComponent({
  name: "Harness",
  setup() {
    const isOpen = ref(false);
    const closeCount = ref(0);
    const onClose = () => {
      isOpen.value = false;
      closeCount.value += 1;
    };
    return () => (
      <div>
        <output data-testid="close-count">{closeCount.value}</output>
        <button data-testid="open" onClick={() => (isOpen.value = true)}>
          Open
        </button>
        <ElmModal isOpen={isOpen.value} onClose={onClose} delay={0}>
          <p>Modal body</p>
        </ElmModal>
      </div>
    );
  },
});

describe("[browser] ElmModal open lifecycle", () => {
  test("showModal() runs on open and renders content", async () => {
    const screen = render(Harness);

    await screen.getByTestId("open").click();

    // The dialog only becomes a top-layer modal after the watcher fires
    // showModal(); wait for the native open state to settle before asserting.
    const dialog = document.querySelector("dialog")!;
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    await expect.element(screen.getByText("Modal body")).toBeVisible();
    // `shown` drives the fade-in opacity once showModal() has run.
    await vi.waitFor(() => expect(dialog.className).toContain("shown"));
  });

  test("backdrop click fires onClose", async () => {
    const screen = render(Harness);

    await screen.getByTestId("open").click();
    const dialog = document.querySelector("dialog")!;
    await vi.waitFor(() => expect(dialog.open).toBe(true));

    // A click landing on the <dialog> itself (the backdrop area, outside the
    // inner content wrapper) reaches the dialog's onClick → onClose.
    dialog.click();

    await vi.waitFor(() =>
      expect(screen.getByTestId("close-count").element().textContent).toBe("1"),
    );
  });
});
