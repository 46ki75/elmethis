import { render } from "vitest-browser-vue";
import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";

import { useModal } from "./use-modal";

// The native `<dialog>` open lifecycle (`showModal()` -> top layer -> `.close()`)
// needs a real browser. The close control lives INSIDE the modal: a
// showModal() dialog blocks pointer events behind it, so an outside "hide"
// button would be unclickable while open.
const Harness = defineComponent({
  name: "Harness",
  setup() {
    const { Modal, isOpen, show, hide } = useModal({ delay: 0 });
    return () =>
      h("div", [
        h("button", { "data-testid": "show", onClick: show }, "Show"),
        h("output", { "data-testid": "state" }, String(isOpen.value)),
        h(Modal, null, {
          default: () =>
            h("div", [
              h("p", { "data-testid": "content" }, "Dialog Content"),
              h("button", { "data-testid": "close", onClick: hide }, "Close"),
            ]),
        }),
      ]);
  },
});

describe("[browser] useModal native dialog lifecycle", () => {
  test("show() calls showModal() — dialog opens, content visible", async () => {
    const screen = render(Harness);
    const dialog = document.querySelector("dialog")!;

    await screen.getByTestId("show").click();

    await vi.waitFor(() => expect(dialog.open).toBe(true));
    await expect.element(screen.getByTestId("content")).toBeVisible();
    await expect.element(screen.getByTestId("state")).toHaveTextContent("true");
  });

  test("hide() closes the dialog after the fade delay", async () => {
    const screen = render(Harness);
    const dialog = document.querySelector("dialog")!;

    await screen.getByTestId("show").click();
    await vi.waitFor(() => expect(dialog.open).toBe(true));

    // The close button is inside the dialog (reachable while it is modal).
    await screen.getByTestId("close").click();
    await vi.waitFor(() => expect(dialog.open).toBe(false));
  });
});
