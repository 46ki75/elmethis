import { component$ } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { describe, expect, test, vi } from "vitest";

import { useModal } from "./use-modal";

// The native `<dialog>` OPEN lifecycle (`showModal()` -> top layer -> `.close()`)
// is the half that `createDOM` cannot service — it throws
// `_ensureInsertValid is not a function` the moment `isOpen` flips to true (see
// the note in `use-modal.spec.tsx`). That behavior was previously deferred to
// Storybook; this real-browser spec covers it directly. See
// [[feedback_qwik_showmodal_createdom]] and [[project_qwik_browser_testing]].

// `delay: 0` keeps the close timer to a single macrotask so `vi.waitFor`
// resolves quickly. The fade still goes through `setTimeout` -> `.close()`.
// The close control lives INSIDE the modal: a `showModal()` dialog sits in the
// top layer and blocks pointer events to everything behind it, so an outside
// "hide" button would be unclickable while open — exactly as a real modal
// should behave.
const Harness = component$(() => {
  const { Modal, isOpen, show, hide } = useModal({ delay: 0 });
  return (
    <div>
      <button id="show" onClick$={show}>
        Show
      </button>
      <output data-testid="state">{String(isOpen.value)}</output>
      <Modal>
        <p data-testid="content">Dialog Content</p>
        <button id="close" onClick$={hide}>
          Close
        </button>
      </Modal>
    </div>
  );
});

describe("[CSR] useModal native dialog lifecycle", () => {
  test("is closed on mount — the dialog never entered the top layer", async () => {
    await render(<Harness />);

    const dialog = document.querySelector("dialog")!;
    expect(dialog).toBeTruthy();
    // Initially closed: the mount visible-task short-circuits, so showModal()
    // is never called and the content stays hidden.
    expect(dialog.open).toBe(false);
    await expect.element(dialog).not.toBeVisible();
  });

  test("show() calls showModal() — dialog opens, gains .shown, content visible", async () => {
    const screen = await render(<Harness />);
    const dialog = document.querySelector("dialog")!;

    await screen.getByRole("button", { name: "Show", exact: true }).click();

    await vi.waitFor(() => expect(dialog.open).toBe(true));
    await expect.element(screen.getByTestId("content")).toBeVisible();
    // The `.shown` class is what the stylesheet fades in on.
    await vi.waitFor(() => expect(dialog.className).toMatch(/shown/));
    await expect.element(screen.getByTestId("state")).toHaveTextContent("true");
  });

  test("hide() closes the dialog after the fade delay", async () => {
    const screen = await render(<Harness />);
    const dialog = document.querySelector("dialog")!;

    await screen.getByRole("button", { name: "Show", exact: true }).click();
    await vi.waitFor(() => expect(dialog.open).toBe(true));

    // The close button is inside the dialog (reachable while it is modal).
    await screen.getByRole("button", { name: "Close", exact: true }).click();
    // `.shown` is dropped immediately; the native `.close()` lands after the
    // delay timer fires.
    await vi.waitFor(() => expect(dialog.open).toBe(false));
    await expect.element(dialog).not.toBeVisible();
  });

  test("clicking the dialog content does not close it (stopPropagation guard)", async () => {
    const screen = await render(<Harness />);
    const dialog = document.querySelector("dialog")!;

    await screen.getByRole("button", { name: "Show", exact: true }).click();
    await vi.waitFor(() => expect(dialog.open).toBe(true));

    // The slot lives inside a `<div onClick$={stopPropagation}>`, so a click on
    // the content must never reach the dialog's close handler.
    await screen.getByTestId("content").click();

    await expect.element(screen.getByTestId("state")).toHaveTextContent("true");
    expect(dialog.open).toBe(true);
  });

  test("a backdrop click (event on the dialog itself) closes via onClose$", async () => {
    const screen = await render(<Harness />);
    const dialog = document.querySelector("dialog")!;

    await screen.getByRole("button", { name: "Show", exact: true }).click();
    await vi.waitFor(() => expect(dialog.open).toBe(true));

    // A click whose target is the dialog (not the guarded content) is how a
    // backdrop press surfaces — it reaches `onClick$` -> `onClose$` -> hide().
    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    await vi.waitFor(() => expect(dialog.open).toBe(false));
    await expect
      .element(screen.getByTestId("state"))
      .toHaveTextContent("false");
  });
});
