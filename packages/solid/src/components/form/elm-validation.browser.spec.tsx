import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { ElmValidation } from "./elm-validation";

describe("[Browser] ElmValidation", () => {
  it("applies validity opacity and the configured valid color", async () => {
    const rendered = render(() => (
      <ElmValidation
        data-testid="validation"
        text="Looks good"
        isValid
        validColor="rgb(10, 20, 30)"
      />
    ));
    const screen = page.elementLocator(rendered.baseElement);

    await expect.element(screen.getByText("Looks good")).toBeInTheDocument();

    const validation = rendered.getByTestId("validation");
    expect(getComputedStyle(validation).opacity).toBe("1");
    expect(getComputedStyle(validation.querySelector("svg")!).fill).toBe(
      "rgb(10, 20, 30)",
    );
    expect(getComputedStyle(validation.querySelector("span")!).color).toBe(
      "rgb(10, 20, 30)",
    );
  });
});
