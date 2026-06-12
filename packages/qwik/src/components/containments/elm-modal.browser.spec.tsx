import { $, component$, Slot, useSignal } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { describe, expect, test, vi } from "vitest";

import { ElmModal } from "./elm-modal";

// The open lifecycle lives here because `<dialog>.showModal()` throws under
// createDOM — only a real browser has the top layer, native open state, and
// fired `document-ready` visible-task. Mirrors use-modal's browser pattern.
//
// An open `showModal()` dialog sits in the top layer and blocks pointer events
// to everything behind it, so every close control is placed INSIDE the dialog.

// Drives `isOpen` from a signal; the open button is outside (clicked only while
// closed) and the close button is inside the dialog content (clickable while
// open). Slot content is passed by the test.
const Harness = component$(() => {
  const isOpen = useSignal(false);
  const closeCount = useSignal(0);
  const onClose$ = $(() => {
    isOpen.value = false;
    closeCount.value += 1;
  });
  return (
    <div>
      <output data-testid="close-count">{closeCount.value}</output>
      <button data-testid="open" onClick$={() => (isOpen.value = true)}>
        Open
      </button>
      <ElmModal isOpen={isOpen.value} onClose$={onClose$} delay={0}>
        <Slot />
      </ElmModal>
    </div>
  );
});

describe("[CSR] open lifecycle", () => {
  test("showModal() runs on open and renders content", async () => {
    const screen = await render(
      <Harness>
        <div>
          <p>Modal body</p>
        </div>
      </Harness>,
    );

    await screen.getByTestId("open").click();

    // The dialog only becomes a top-layer modal after the visible-task fires
    // showModal(); wait for the native open state to settle before asserting.
    const dialog = document.querySelector("dialog")!;
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    await expect.element(screen.getByText("Modal body")).toBeVisible();
    // `shown` drives the fade-in opacity once showModal() has run.
    await vi.waitFor(() => expect(dialog.className).toContain("shown"));
  });

  test("backdrop click fires onClose$", async () => {
    const screen = await render(
      <Harness>
        <div>
          <p>Body</p>
        </div>
      </Harness>,
    );

    await screen.getByTestId("open").click();
    const dialog = document.querySelector("dialog")!;
    await vi.waitFor(() => expect(dialog.open).toBe(true));

    // A click landing on the <dialog> itself (the backdrop area, outside the
    // inner content wrapper) reaches the dialog's onClick$ → onClose$.
    dialog.click();

    await vi.waitFor(() =>
      expect(screen.getByTestId("close-count").element().textContent).toBe("1"),
    );
  });
});
