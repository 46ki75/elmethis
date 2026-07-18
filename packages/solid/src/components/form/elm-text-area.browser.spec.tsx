import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { ElmTextArea } from "./elm-text-area";
import styles from "./elm-text-area.module.css";

describe("[Browser] ElmTextArea", () => {
  it("tracks a native uncontrolled value from defaultValue through typing", async () => {
    const [committed, setCommitted] = createSignal("none");
    const rendered = render(() => (
      <div>
        <ElmTextArea
          data-testid="area"
          aria-label="Notes"
          label="Notes"
          defaultValue="seed"
          maxLength={30}
          onChange={(event) => setCommitted(event.currentTarget.value)}
        />
        <output data-testid="committed">{committed()}</output>
        <button type="button">Outside</button>
      </div>
    ));
    const screen = page.elementLocator(rendered.baseElement);
    const area = screen.getByTestId("area");

    await expect.element(area).toHaveValue("seed");
    expect(rendered.container).toHaveTextContent("4 / 30");
    await area.fill("hello browser");
    expect(rendered.container).toHaveTextContent("13 / 30");
    await expect
      .element(screen.getByTestId("committed"))
      .toHaveTextContent("none");

    await screen.getByRole("button", { name: "Outside" }).click();
    await expect
      .element(screen.getByTestId("committed"))
      .toHaveTextContent("hello browser");
  });

  it("retains native rows, resize, disabled cursor, and loading styles", () => {
    const rendered = render(() => (
      <ElmTextArea
        data-testid="area"
        label="Busy"
        isLoading
        style={{ width: "280px" }}
      />
    ));
    const textarea = rendered.getByTestId("area") as HTMLTextAreaElement;
    const root = textarea.closest("label")!;
    const loading = root.querySelector(`.${styles.loading}`)!;

    expect(textarea.rows).toBe(3);
    expect(textarea).toBeDisabled();
    expect(getComputedStyle(textarea).resize).toBe("vertical");
    expect(getComputedStyle(textarea).cursor).toBe("progress");
    expect(getComputedStyle(root).width).toBe("280px");
    expect(getComputedStyle(loading).opacity).toBe("1");
  });
});
