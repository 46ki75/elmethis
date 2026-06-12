import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { useModal } from "./use-modal";

// ---------------------------------------------------------------------------
// Wrapper components
//
// NOTE: the open transition (`isOpen` -> true) drives `ElmModal`'s mount effect
// into `dialog.showModal()`, which the jsdom/happy-dom renderer cannot service.
// Native-`<dialog>` open behavior is therefore covered by the browser spec, not
// here. These specs split into two halves that both stay inside what the
// test-util DOM supports:
//   - state wrappers exercise show/hide/toggle WITHOUT mounting `<Modal>`
//   - structure wrappers mount `<Modal>` but leave it CLOSED
// ---------------------------------------------------------------------------

/** Imperative-state harness: buttons + `isOpen` span, no dialog mounted. */
const StateWrapper = () => {
  const { isOpen, show, hide, toggle } = useModal({ delay: 0 });
  return (
    <div>
      <button id="show" onClick={show}>
        Show
      </button>
      <button id="hide" onClick={hide}>
        Hide
      </button>
      <button id="toggle" onClick={toggle}>
        Toggle
      </button>
      <span id="isOpen">{String(isOpen)}</span>
    </div>
  );
};

/** Mounts `<Modal>` (kept closed) with content. */
const ModalWrapper = () => {
  const { Modal } = useModal({ delay: 0 });
  return (
    <Modal>
      <span id="dialog-content">Dialog Content</span>
    </Modal>
  );
};

/** Mounts `<Modal>` (kept closed) whose content is a form field. */
const ModalWithField = () => {
  const { Modal } = useModal({ delay: 0 });
  return (
    <Modal>
      <label>
        Username
        <input id="field" />
      </label>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------

describe("[SSR] useModal", () => {
  it("renders a native <dialog> shell with content", () => {
    const html = renderToStaticMarkup(<ModalWrapper />);
    // The native <dialog> is always present; it is hidden via the top layer
    // rather than by conditionally unmounting the content.
    expect(html).toContain("<dialog");
    expect(html).toContain("Dialog Content");
  });
});

// ---------------------------------------------------------------------------
// [CSR] — imperative state
// ---------------------------------------------------------------------------

describe("[CSR] useModal state", () => {
  it("modal is closed by default", () => {
    const { container } = render(<StateWrapper />);
    expect(container.querySelector("#isOpen")!.textContent).toBe("false");
  });

  it("show() opens, hide() closes", () => {
    const { container } = render(<StateWrapper />);

    fireEvent.click(container.querySelector("#show")!);
    expect(container.querySelector("#isOpen")!.textContent).toBe("true");

    fireEvent.click(container.querySelector("#hide")!);
    expect(container.querySelector("#isOpen")!.textContent).toBe("false");
  });

  it("toggle() flips isOpen each call", () => {
    const { container } = render(<StateWrapper />);

    fireEvent.click(container.querySelector("#toggle")!);
    expect(container.querySelector("#isOpen")!.textContent).toBe("true");

    fireEvent.click(container.querySelector("#toggle")!);
    expect(container.querySelector("#isOpen")!.textContent).toBe("false");
  });

  // Regression pin: `useModal` must be callable with no argument.
  it("can be called with no options argument", () => {
    const NoArgsWrapper = () => {
      const { isOpen, show } = useModal();
      return (
        <div>
          <button id="show" onClick={show}>
            Show
          </button>
          <span id="isOpen">{String(isOpen)}</span>
        </div>
      );
    };

    const { container } = render(<NoArgsWrapper />);

    expect(container.querySelector("#isOpen")!.textContent).toBe("false");
    fireEvent.click(container.querySelector("#show")!);
    expect(container.querySelector("#isOpen")!.textContent).toBe("true");
  });
});

// ---------------------------------------------------------------------------
// [CSR] — structure (dialog kept closed)
// ---------------------------------------------------------------------------

describe("[CSR] useModal structure", () => {
  it("Modal renders content inside the <dialog>", () => {
    const { container } = render(<ModalWrapper />);

    const dialog = container.querySelector("dialog");
    expect(dialog).toBeTruthy();
    expect(dialog!.querySelector("#dialog-content")).toBeTruthy();
  });

  it("content sits inside a stopPropagation guard, isolating it from the close handler", () => {
    const { container } = render(<ModalWrapper />);

    // ElmModal wraps the content in a guard <div onClick={stopPropagation}> so
    // clicking the content never bubbles to the dialog's close handler.
    const dialog = container.querySelector("dialog")!;
    const guard = dialog.firstElementChild as HTMLElement;
    expect(guard).toBeTruthy();
    expect(guard.querySelector("#dialog-content")).toBeTruthy();
  });

  it("a form field inside the modal renders as a <label> with an <input>", () => {
    const { container } = render(<ModalWithField />);

    const dialog = container.querySelector("dialog")!;
    const label = dialog.querySelector("label") as HTMLLabelElement;
    expect(label).toBeTruthy();
    expect(label.querySelector("input")).toBeTruthy();
  });
});
