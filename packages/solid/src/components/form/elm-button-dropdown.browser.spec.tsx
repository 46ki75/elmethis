import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import { ElmButtonDropdown } from "./elm-button-dropdown";

const ITEMS = [
  { id: "edit", label: "Edit" },
  { id: "remove", label: "Remove" },
];

describe("[Browser] ElmButtonDropdown", () => {
  it("keeps main and caret behavior separate and closes outside", async () => {
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    const rendered = render(() => (
      <div>
        <button>Outside</button>
        <ElmButtonDropdown
          label="Run"
          items={ITEMS}
          onClick={onClick}
          onOpenChange={onOpenChange}
        />
      </div>
    ));
    const screen = page.elementLocator(rendered.baseElement);
    const caret = screen.getByRole("button", { name: "Toggle dropdown" });

    await screen.getByRole("button", { name: "Run" }).click();
    expect(onClick).toHaveBeenCalledWith(null);
    await expect.element(caret).toHaveAttribute("aria-expanded", "false");

    await caret.click();
    await expect.element(caret).toHaveAttribute("aria-expanded", "true");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await screen.getByRole("button", { name: "Outside" }).click();
    await expect.element(caret).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("selects a keyed item, auto-closes, and uses joined block layout", async () => {
    const rendered = render(() => (
      <div data-testid="container" style={{ width: "320px" }}>
        <ElmButtonDropdown
          data-testid="dropdown"
          label="Run"
          items={ITEMS}
          block
        />
      </div>
    ));
    const screen = page.elementLocator(rendered.baseElement);
    const container = rendered.getByTestId("container");
    const dropdown = rendered.getByTestId("dropdown");
    const caret = screen.getByRole("button", { name: "Toggle dropdown" });

    expect(dropdown.getBoundingClientRect().width).toBe(
      container.getBoundingClientRect().width,
    );

    await caret.click();
    await screen.getByText("Remove").click();

    await expect
      .element(screen.getByRole("button", { name: "Remove" }))
      .toBeInTheDocument();
    await expect.element(caret).toHaveAttribute("aria-expanded", "false");

    const buttons = dropdown.querySelectorAll("button");
    expect(getComputedStyle(buttons[0]).borderTopRightRadius).toBe("0px");
    expect(getComputedStyle(buttons[1]).borderTopLeftRadius).toBe("0px");
  });
});
