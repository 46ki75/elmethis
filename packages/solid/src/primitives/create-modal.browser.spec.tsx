import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";

import { createModal } from "./create-modal";

const Harness = () => {
  const modal = createModal({ delay: 0 });
  const Modal = modal.Modal;

  return (
    <>
      <button type="button" onClick={modal.show}>
        Show
      </button>
      <output data-testid="state">{String(modal.isOpen())}</output>
      <Modal>
        <span>Dialog content</span>
        <button type="button" onClick={modal.hide}>
          Hide
        </button>
      </Modal>
    </>
  );
};

describe("[Browser] createModal", () => {
  it("drives one stable native dialog through show and hide", async () => {
    const rendered = render(() => <Harness />);
    const dialog = rendered.container.querySelector("dialog")!;

    rendered.getByRole("button", { name: "Show" }).click();
    await vi.waitFor(() => expect(dialog.open).toBe(true));
    expect(rendered.getByTestId("state")).toHaveTextContent("true");

    rendered.getByRole("button", { name: "Hide" }).click();
    await vi.waitFor(() => expect(dialog.open).toBe(false));
    expect(rendered.getByTestId("state")).toHaveTextContent("false");
    expect(rendered.container.querySelector("dialog")).toBe(dialog);
  });
});
