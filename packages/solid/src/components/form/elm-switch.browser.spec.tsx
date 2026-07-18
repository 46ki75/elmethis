import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { ElmSwitch } from "./elm-switch";
import styles from "./elm-switch.module.css";

describe("[Browser] ElmSwitch", () => {
  it("applies configured dimensions, checked color, and thumb translation", async () => {
    const rendered = render(() => (
      <ElmSwitch
        data-testid="switch"
        aria-label="Browser switch"
        checked
        color="rgb(10, 20, 30)"
        size="20px"
      />
    ));
    const screen = page.elementLocator(rendered.baseElement);

    await expect
      .element(screen.getByLabelText("Browser switch"))
      .toBeInTheDocument();

    const switchRoot = rendered.getByTestId("switch");
    const bar = switchRoot.querySelector(`.${styles.bar}`)!;
    const circle = switchRoot.querySelector(`.${styles.circle}`)!;

    expect(getComputedStyle(bar).width).toBe("44px");
    expect(getComputedStyle(bar).height).toBe("20px");
    expect(getComputedStyle(bar).backgroundColor).toBe("rgb(10, 20, 30)");
    expect(getComputedStyle(circle).transform).not.toBe("none");
    expect(circle.getBoundingClientRect().left).toBeGreaterThan(
      bar.getBoundingClientRect().left,
    );
  });
});
