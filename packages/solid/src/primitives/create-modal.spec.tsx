import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";

import { createModal } from "./create-modal";

const Harness = () => {
  const modal = createModal({ delay: 0 });
  const stableModal = modal.Modal;

  return (
    <div>
      <button type="button" onClick={modal.show}>
        Show
      </button>
      <button type="button" onClick={modal.hide}>
        Hide
      </button>
      <button type="button" onClick={modal.toggle}>
        Toggle
      </button>
      <output data-testid="state">{String(modal.isOpen())}</output>
      <output data-testid="stable">
        {String(stableModal === modal.Modal)}
      </output>
      <modal.Modal>
        <span>Dialog content</span>
      </modal.Modal>
    </div>
  );
};

describe("[CSR] createModal", () => {
  it("returns a stable Modal component, accessor, and controls", () => {
    const rendered = render(() => <Harness />);

    expect(rendered.getByTestId("state")).toHaveTextContent("false");
    expect(rendered.getByTestId("stable")).toHaveTextContent("true");
    expect(rendered.container.querySelector("dialog")).toHaveTextContent(
      "Dialog content",
    );

    fireEvent.click(rendered.getByRole("button", { name: "Show" }));
    expect(rendered.getByTestId("state")).toHaveTextContent("true");

    fireEvent.click(rendered.getByRole("button", { name: "Hide" }));
    expect(rendered.getByTestId("state")).toHaveTextContent("false");

    fireEvent.click(rendered.getByRole("button", { name: "Toggle" }));
    expect(rendered.getByTestId("state")).toHaveTextContent("true");
  });

  it("can be created without options", () => {
    const NoOptions = () => {
      const modal = createModal();
      return <output>{String(modal.isOpen())}</output>;
    };

    const rendered = render(() => <NoOptions />);
    expect(rendered.getByText("false")).toBeInTheDocument();
  });
});
