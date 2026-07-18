import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { ElmDivider } from "./elm-divider";

describe("[Browser] ElmDivider", () => {
  it("applies its dashed full-width divider style", async () => {
    const rendered = render(() => (
      <div data-testid="container" style={{ width: "240px" }}>
        <ElmDivider />
      </div>
    ));
    const screen = page.elementLocator(rendered.baseElement);

    await expect.element(screen.getByRole("separator")).toBeInTheDocument();

    const container = rendered.getByTestId("container");
    const divider = rendered.getByRole("separator");
    const style = getComputedStyle(divider);

    expect(style.borderBottomStyle).toBe("dashed");
    expect(divider.getBoundingClientRect().width).toBe(
      container.getBoundingClientRect().width,
    );
  });
});
