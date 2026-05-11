import { component$ } from "@builder.io/qwik";
import { createDOM } from "@builder.io/qwik/testing";
import { renderToString } from "@builder.io/qwik/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useModal } from "./useModal";
import { ElmTextField } from "../components/form/elm-text-field";

// ---------------------------------------------------------------------------
// Wrapper components
// ---------------------------------------------------------------------------

/** Simple modal wrapper that exposes open button, state spans, and dialog content. */
const ModalWrapper = component$(() => {
  const { Modal, isOpen, isShown, show } = useModal({ delay: 0 });
  return (
    <div>
      <button id="open" onClick$={show}>
        Open
      </button>
      <span id="isOpen">{String(isOpen.value)}</span>
      <span id="isShown">{String(isShown.value)}</span>
      <Modal>
        <span id="dialog-content">Dialog Content</span>
      </Modal>
    </div>
  );
});

/** Modal wrapper whose content is an ElmTextField (reproduces the reported bug). */
const ModalWithTextField = component$(() => {
  const { Modal, isOpen, isShown, show } = useModal({ delay: 0 });
  return (
    <div>
      <button id="open" onClick$={show}>
        Open
      </button>
      <span id="isOpen">{String(isOpen.value)}</span>
      <span id="isShown">{String(isShown.value)}</span>
      <Modal>
        <ElmTextField label="Username" />
      </Modal>
    </div>
  );
});

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------

describe("[SSR]", () => {
  test("renders open button but dialog wrapper is absent when closed", async () => {
    const result = await renderToString(<ModalWrapper />, {
      containerTagName: "div",
      symbolMapper: (symbolName, _mapper, parent) => [
        symbolName,
        parent ?? symbolName,
      ],
    });
    expect(result.html).toContain("Open");
    // div[role="dialog"] is not rendered when modal is initially closed.
    expect(result.html).not.toContain('role="dialog"');
  });
});

// ---------------------------------------------------------------------------
// [CSR]
// ---------------------------------------------------------------------------

describe("[CSR]", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  test("modal is closed by default", async () => {
    const { screen, render } = await createDOM();
    await render(<ModalWrapper />);
    expect(screen.querySelector("#isOpen")!.textContent).toBe("false");
    expect(screen.querySelector("#isShown")!.textContent).toBe("false");
    // The dialog wrapper is not rendered when modal is closed
    // (slot content lives in a hidden <q:template>, not in a live dialog div).
    expect(screen.querySelector('[role="dialog"]')).toBeFalsy();
  });

  test("show() opens the modal and reveals content", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ModalWrapper />);

    await userEvent("#open", "click");

    expect(screen.querySelector("#isOpen")!.textContent).toBe("true");
    expect(screen.querySelector("#isShown")!.textContent).toBe("true");
    // Dialog is now rendered.
    expect(screen.querySelector('[role="dialog"]')).toBeTruthy();
    expect(
      screen.querySelector('[role="dialog"] #dialog-content'),
    ).toBeTruthy();
  });

  test("clicking the backdrop closes the modal", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ModalWrapper />);

    await userEvent("#open", "click");
    expect(screen.querySelector("#isShown")!.textContent).toBe("true");

    // The backdrop is the parent element of div[role="dialog"].
    const backdrop = screen
      .querySelector('[role="dialog"]')!
      .parentElement as HTMLElement;
    await userEvent(backdrop, "click");

    expect(screen.querySelector("#isShown")!.textContent).toBe("false");
  });

  // -------------------------------------------------------------------------
  // Fix 1 — structural test
  // -------------------------------------------------------------------------

  test("dialog div has stoppropagation:click attribute (Fix 1)", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ModalWrapper />);

    await userEvent("#open", "click");

    // The dialog div must carry stoppropagation:click so that Qwik's
    // document-level event walk stops synchronously without loading any QRL.
    const dialog = screen.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.hasAttribute("stoppropagation:click")).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Fix 2 — structural tests for ElmTextField
  // -------------------------------------------------------------------------

  test("ElmTextField renders as <label> wrapper with <input> inside (Fix 2)", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmTextField label="Username" />);

    // Root element must be a <label> (implicit association — no for= needed).
    const wrapper = screen.querySelector("label") as HTMLLabelElement;
    expect(wrapper).toBeTruthy();

    // The <input> must be a descendant of the label.
    const input = wrapper.querySelector("input") as HTMLInputElement;
    expect(input).toBeTruthy();
  });

  test("ElmTextField <label> has no for= attribute (Fix 2)", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmTextField label="Username" />);

    const labels = Array.from(screen.querySelectorAll("label"));
    // No <label> element should carry a for= attribute.
    for (const label of labels) {
      expect(label.getAttribute("for")).toBeNull();
    }
  });

  test("ElmTextField inside modal: dialog retains stoppropagation:click (Fix 1 + Fix 2)", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ModalWithTextField />);

    await userEvent("#open", "click");

    const dialog = screen.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.hasAttribute("stoppropagation:click")).toBe(true);

    // ElmTextField inside the dialog renders as a label (no for=).
    const textFieldLabel = dialog.querySelector("label") as HTMLLabelElement;
    expect(textFieldLabel).toBeTruthy();
    expect(textFieldLabel.getAttribute("for")).toBeNull();
    expect(textFieldLabel.querySelector("input")).toBeTruthy();
  });
});

