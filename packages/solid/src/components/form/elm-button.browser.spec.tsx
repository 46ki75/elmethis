import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { ElmButton } from "./elm-button";

describe("[Browser] ElmButton", () => {
  it("applies block layout, loading opacity, and consumer style overrides", async () => {
    const rendered = render(() => (
      <div data-testid="container" style={{ width: "240px" }}>
        <ElmButton
          data-testid="button"
          block
          isLoading
          color="red"
          style={{ "background-color": "rgb(10, 20, 30)" }}
          aria-label="Saving"
        />
      </div>
    ));
    const screen = page.elementLocator(rendered.baseElement);

    await expect
      .element(screen.getByRole("button", { name: "Saving" }))
      .toBeInTheDocument();

    const container = rendered.getByTestId("container");
    const button = rendered.getByTestId("button");
    const style = getComputedStyle(button);

    expect(button.getBoundingClientRect().width).toBe(
      container.getBoundingClientRect().width,
    );
    expect(style.display).toBe("flex");
    expect(style.cursor).toBe("progress");
    expect(style.opacity).toBe("0.6");
    expect(style.backgroundColor).toBe("rgb(10, 20, 30)");
  });
});
