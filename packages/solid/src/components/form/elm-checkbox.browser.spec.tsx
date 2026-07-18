import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { ElmCheckbox } from "./elm-checkbox";
import styles from "./elm-checkbox.module.css";

describe("[Browser] ElmCheckbox", () => {
  it("applies checked fill and disabled interaction styles", async () => {
    const rendered = render(() => (
      <ElmCheckbox
        data-testid="checkbox"
        label="Browser checkbox"
        defaultChecked
        disabled
      />
    ));
    const screen = page.elementLocator(rendered.baseElement);

    await expect
      .element(screen.getByText("Browser checkbox"))
      .toBeInTheDocument();

    const checkbox = rendered.getByTestId("checkbox");
    const rect = checkbox.querySelector(`.${styles.rect}`)!;

    expect(getComputedStyle(checkbox).opacity).toBe("0.45");
    expect(getComputedStyle(checkbox).cursor).toBe("not-allowed");
    expect(getComputedStyle(rect).fill).not.toBe("none");
    expect(checkbox.querySelector(`.${styles["check-line"]}`)).not.toBeNull();
  });
});
