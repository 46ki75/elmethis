import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmModal } from "./elm-modal";

describe("[CSR] ElmModal", () => {
  it("renders a closed native shell and composes attributes, class, style, and ref", () => {
    let root: HTMLDialogElement | undefined;
    const rendered = render(() => (
      <ElmModal
        ref={(element) => {
          root = element;
        }}
        class="custom-modal"
        data-testid="modal"
        aria-label="Example modal"
        delay={500}
        style={{ color: "red" }}
      >
        <span>Modal body</span>
      </ElmModal>
    ));
    const dialog = rendered.getByTestId("modal") as HTMLDialogElement;

    expect(dialog).toBe(root);
    expect(dialog).not.toHaveAttribute("open");
    expect(dialog).toHaveClass("custom-modal");
    expect(dialog).toHaveAttribute("aria-label", "Example modal");
    expect(dialog).toHaveAttribute("closedby", "none");
    expect(dialog.style.color).toBe("red");
    expect(dialog.style.getPropertyValue("--elmethis-scoped-modal-delay")).toBe(
      "500ms",
    );
    expect(dialog).toHaveTextContent("Modal body");
  });

  it("reactively updates delay and native attributes", () => {
    const [delay, setDelay] = createSignal(100);
    const [label, setLabel] = createSignal("First");
    const rendered = render(() => (
      <ElmModal delay={delay()} aria-label={label()} data-testid="modal" />
    ));
    const dialog = rendered.getByTestId("modal") as HTMLDialogElement;

    setDelay(350);
    setLabel("Second");

    expect(dialog.style.getPropertyValue("--elmethis-scoped-modal-delay")).toBe(
      "350ms",
    );
    expect(dialog).toHaveAttribute("aria-label", "Second");
  });

  it("composes root clicks and only requests close for the dialog target", () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    const rendered = render(() => (
      <ElmModal onClick={onClick} onClose={onClose} data-testid="modal">
        <button type="button">Inside</button>
      </ElmModal>
    ));
    const dialog = rendered.getByTestId("modal") as HTMLDialogElement;

    fireEvent.click(dialog.querySelector("button")!);
    expect(onClick).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(dialog);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledWith(expect.any(MouseEvent), dialog);
  });

  it("honors a composed click handler that prevents backdrop closing", () => {
    const onClose = vi.fn();
    const rendered = render(() => (
      <ElmModal
        data-testid="modal"
        onClick={(event) => event.preventDefault()}
        onClose={onClose}
      />
    ));

    fireEvent.click(rendered.getByTestId("modal"));
    expect(onClose).not.toHaveBeenCalled();
  });
});
