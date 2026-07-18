import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import styles from "./elm-toggle.module.css";
import { ElmToggle } from "./elm-toggle";

describe("[Browser] ElmToggle", () => {
  it("expands the content row and rotates both indicators", async () => {
    const rendered = render(() => (
      <ElmToggle
        data-testid="toggle"
        style={{ "transition-duration": "0ms" }}
        summary="Summary"
      >
        <div style={{ height: "48px" }}>Body content</div>
      </ElmToggle>
    ));
    const screen = page.elementLocator(rendered.baseElement);
    const toggle = rendered.getByTestId("toggle");
    const content = toggle.querySelector(`.${styles.content}`)!;
    const closedRows = getComputedStyle(toggle).gridTemplateRows;

    expect(getComputedStyle(content).overflow).toBe("hidden");
    await screen.getByText("Summary").click();

    await vi.waitFor(() => expect(toggle).toHaveClass(styles.open));
    expect(getComputedStyle(toggle).gridTemplateRows).not.toBe(closedRows);
    expect(
      getComputedStyle(toggle.querySelector(`.${styles.chevron}`)!).transform,
    ).not.toBe("none");
    expect(
      getComputedStyle(toggle.querySelector(`.${styles.cross}`)!).transform,
    ).not.toBe("none");
  });
});
