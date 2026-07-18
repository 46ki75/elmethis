import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { ElmSelect } from "./elm-select";
import styles from "./elm-select.module.css";

const Harness = () => {
  const [selected, setSelected] = createSignal<string | null>(null);

  return (
    <div>
      <button>Outside</button>
      <output data-testid="selected">{selected() ?? "none"}</output>
      <ElmSelect
        data-testid="select"
        label="Fruit"
        selectedOptionId={selected()}
        onSelectedOptionIdChange={setSelected}
        options={[
          { id: "a", label: "Apple" },
          { id: "b", label: "Banana" },
        ]}
      />
    </div>
  );
};

describe("[Browser] ElmSelect", () => {
  it("selects an option and closes on a genuine outside click", async () => {
    const rendered = render(() => <Harness />);
    const screen = page.elementLocator(rendered.baseElement);
    const select = rendered.getByTestId("select");

    await screen.getByText("Fruit").click();
    expect(select).toHaveClass(styles.active);

    await screen.getByText("Banana").click();
    await expect.element(screen.getByTestId("selected")).toHaveTextContent("b");
    expect(select).not.toHaveClass(styles.active);

    await screen.getByText("Fruit").click();
    await screen.getByRole("button", { name: "Outside" }).click();
    expect(select).not.toHaveClass(styles.active);
  });

  it("applies native interaction and open transition styles", async () => {
    const rendered = render(() => (
      <ElmSelect
        data-testid="enabled"
        label="Enabled"
        options={[{ id: "a", label: "Apple" }]}
      />
    ));
    const screen = page.elementLocator(rendered.baseElement);
    const select = rendered.getByTestId("enabled");
    await screen.getByText("Enabled").click();

    const style = getComputedStyle(select);
    expect(select).toHaveClass(styles.active);
    expect(style.cursor).toBe("pointer");
    expect(style.userSelect).toBe("none");
    expect(style.transitionProperty).toContain("border-color");
  });
});
