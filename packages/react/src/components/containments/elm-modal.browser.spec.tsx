import { useState, type ReactNode } from "react";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { describe, expect, test, vi } from "vitest";

import { ElmModal } from "./elm-modal";

// The open lifecycle lives here because `<dialog>.showModal()` needs a real
// browser — only it has the top layer and native open state. Mirrors
// use-modal's browser pattern.
//
// An open `showModal()` dialog sits in the top layer and blocks pointer events
// to everything behind it, so every close control is placed INSIDE the dialog.

// Drives `isOpen` from state; the open button is outside (clicked only while
// closed) and the modal content is passed by the test.
const Harness = ({ children }: { children?: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [closeCount, setCloseCount] = useState(0);
  const onClose = () => {
    setIsOpen(false);
    setCloseCount((prev) => prev + 1);
  };
  return (
    <div>
      <output data-testid="close-count">{closeCount}</output>
      <button data-testid="open" onClick={() => setIsOpen(true)}>
        Open
      </button>
      <ElmModal isOpen={isOpen} onClose={onClose} delay={0}>
        {children}
      </ElmModal>
    </div>
  );
};

describe("[CSR] open lifecycle", () => {
  test("showModal() runs on open and renders content", async () => {
    render(
      <Harness>
        <div>
          <p>Modal body</p>
        </div>
      </Harness>,
    );

    await page.getByTestId("open").click();

    // The dialog only becomes a top-layer modal after the effect fires
    // showModal(); wait for the native open state to settle before asserting.
    const dialog = document.querySelector("dialog")!;
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    await expect.element(page.getByText("Modal body")).toBeVisible();
    // `shown` drives the fade-in opacity once showModal() has run.
    await vi.waitFor(() => expect(dialog.className).toContain("shown"));
  });

  test("backdrop click fires onClose", async () => {
    render(
      <Harness>
        <div>
          <p>Body</p>
        </div>
      </Harness>,
    );

    await page.getByTestId("open").click();
    const dialog = document.querySelector("dialog")!;
    await vi.waitFor(() => expect(dialog.open).toBe(true));

    // A click landing on the <dialog> itself (the backdrop area, outside the
    // inner content wrapper) reaches the dialog's onClick → onClose.
    dialog.click();

    await vi.waitFor(() =>
      expect(page.getByTestId("close-count").element().textContent).toBe("1"),
    );
  });
});
