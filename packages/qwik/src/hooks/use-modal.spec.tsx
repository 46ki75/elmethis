// @vitest-environment happy-dom

import { component$ } from "@qwik.dev/core";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";
import { describe, expect, test } from "vitest";

import { useModal } from "./use-modal";
import { ElmTextField } from "../components/form/elm-text-field";

// ---------------------------------------------------------------------------
// Wrapper components
//
// NOTE: the open transition (`isOpen` -> true) drives `ElmModal`'s
// `useVisibleTask$` into `dialog.showModal()`, which the Qwik `createDOM`
// renderer cannot service (it throws `_ensureInsertValid is not a function`).
// Native-`<dialog>` open behavior is therefore covered by Storybook, not here.
// These specs split into two halves that both stay inside what `createDOM`
// supports:
//   - state wrappers exercise show/hide/toggle WITHOUT mounting `<Modal>`
//   - structure wrappers mount `<Modal>` but leave it CLOSED
// ---------------------------------------------------------------------------

/** Imperative-state harness: buttons + `isOpen` span, no dialog mounted. */
const StateWrapper = component$(() => {
  const { isOpen, show, hide, toggle } = useModal({ delay: 0 });
  return (
    <div>
      <button id="show" onClick$={show}>
        Show
      </button>
      <button id="hide" onClick$={hide}>
        Hide
      </button>
      <button id="toggle" onClick$={toggle}>
        Toggle
      </button>
      <span id="isOpen">{String(isOpen.value)}</span>
    </div>
  );
});

/** Mounts `<Modal>` (kept closed) with slotted content. */
const ModalWrapper = component$(() => {
  const { Modal } = useModal({ delay: 0 });
  return (
    <Modal>
      <span id="dialog-content">Dialog Content</span>
    </Modal>
  );
});

/** Mounts `<Modal>` (kept closed) whose content is an ElmTextField. */
const ModalWithTextField = component$(() => {
  const { Modal } = useModal({ delay: 0 });
  return (
    <Modal>
      <ElmTextField label="Username" />
    </Modal>
  );
});

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------

describe("[SSR]", () => {
  test("renders a native <dialog> shell with slotted content", async () => {
    const result = await renderToString(<ModalWrapper />, {
      containerTagName: "div",
      symbolMapper: (symbolName, _mapper, parent) => [
        symbolName,
        parent ?? symbolName,
      ],
    });
    // The native <dialog> is always present now; it is hidden via the top
    // layer rather than by conditionally unmounting the slot content.
    expect(result.html).toContain("<dialog");
    expect(result.html).toContain("Dialog Content");
  });
});

// ---------------------------------------------------------------------------
// [CSR] — imperative state
// ---------------------------------------------------------------------------

describe("[CSR] state", () => {
  test("modal is closed by default", async () => {
    const { screen, render } = await createDOM();
    await render(<StateWrapper />);
    expect(screen.querySelector("#isOpen")!.textContent).toBe("false");
  });

  test("show() opens, hide() closes", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<StateWrapper />);

    await userEvent("#show", "click");
    expect(screen.querySelector("#isOpen")!.textContent).toBe("true");

    await userEvent("#hide", "click");
    expect(screen.querySelector("#isOpen")!.textContent).toBe("false");
  });

  test("toggle() flips isOpen each call", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<StateWrapper />);

    await userEvent("#toggle", "click");
    expect(screen.querySelector("#isOpen")!.textContent).toBe("true");

    await userEvent("#toggle", "click");
    expect(screen.querySelector("#isOpen")!.textContent).toBe("false");
  });

  // Regression pin: `useModal` must be callable with no argument.
  test("can be called with no options argument", async () => {
    const NoArgsWrapper = component$(() => {
      const { isOpen, show } = useModal();
      return (
        <div>
          <button id="show" onClick$={show}>
            Show
          </button>
          <span id="isOpen">{String(isOpen.value)}</span>
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<NoArgsWrapper />);

    expect(screen.querySelector("#isOpen")!.textContent).toBe("false");
    await userEvent("#show", "click");
    expect(screen.querySelector("#isOpen")!.textContent).toBe("true");
  });
});

// ---------------------------------------------------------------------------
// [CSR] — structure (dialog kept closed)
// ---------------------------------------------------------------------------

describe("[CSR] structure", () => {
  test("Modal renders slotted content inside the <dialog>", async () => {
    const { screen, render } = await createDOM();
    await render(<ModalWrapper />);

    const dialog = screen.querySelector("dialog");
    expect(dialog).toBeTruthy();
    expect(dialog!.querySelector("#dialog-content")).toBeTruthy();
  });

  test("content sits inside a stopPropagation guard, isolating it from the close handler", async () => {
    const { screen, render } = await createDOM();
    await render(<ModalWrapper />);

    // ElmModal wraps the slot in a guard <div onClick$={stopPropagation}> so
    // clicking the content never bubbles to the dialog's close handler.
    const dialog = screen.querySelector("dialog")!;
    const guard = dialog.firstElementChild as HTMLElement;
    expect(guard).toBeTruthy();
    expect(guard.querySelector("#dialog-content")).toBeTruthy();
  });

  test("ElmTextField inside the modal renders as a <label> with an <input> (no for=)", async () => {
    const { screen, render } = await createDOM();
    await render(<ModalWithTextField />);

    const dialog = screen.querySelector("dialog")!;
    const label = dialog.querySelector("label") as HTMLLabelElement;
    expect(label).toBeTruthy();
    expect(label.getAttribute("for")).toBeNull();
    expect(label.querySelector("input")).toBeTruthy();
  });
});
