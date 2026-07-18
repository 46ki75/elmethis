import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmDivider } from "./elm-divider";

describe("[CSR] ElmDivider", () => {
  it("renders an <hr> and forwards native attributes", () => {
    const { getByRole } = render(() => (
      <ElmDivider aria-label="Section break" data-testid="divider" />
    ));

    const divider = getByRole("separator", { name: "Section break" });
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveAttribute("data-testid", "divider");
  });

  it("merges and reactively updates a passthrough class", () => {
    const [className, setClassName] = createSignal("custom-divider");
    const { getByRole } = render(() => <ElmDivider class={className()} />);
    const divider = getByRole("separator");

    expect(divider).toHaveClass("custom-divider");

    setClassName("updated-divider");

    expect(divider).not.toHaveClass("custom-divider");
    expect(divider).toHaveClass("updated-divider");
  });
});
