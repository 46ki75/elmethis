import { render } from "vitest-browser-react";
import { describe, expect, test, vi } from "vitest";

import {
  ElmButtonDropdown,
  type ElmButtonDropdownItem,
} from "./elm-button-dropdown";

// ElmButtonDropdown's menu is rendered by ElmCollapse, which clips its content
// (grid-template-rows: 0fr + overflow: hidden) instead of removing it — so the
// items always report "visible". Open/closed is observed via the caret's
// `aria-expanded`. The per-item inline `onClick`, the two-segment split (main
// fires `onClick`, caret toggles), and the outside-click close all need a real
// browser, so they are exercised here rather than in the SSR layer.

const ITEMS: ElmButtonDropdownItem[] = [
  { id: "edit", label: "Edit" },
  { id: "remove", label: "Remove" },
];

const Harness = (props: {
  onClick?: () => void;
  onItemClick?: (item: ElmButtonDropdownItem) => void;
}) => (
  <div>
    <button>outside</button>
    <ElmButtonDropdown
      label="Run"
      items={ITEMS}
      onClick={props.onClick}
      onItemClick={props.onItemClick}
    />
  </div>
);

const expanded = (el: Element) => el.getAttribute("aria-expanded") === "true";

describe("[CSR] ElmButtonDropdown", () => {
  test("the caret opens the menu and an item click fires its handler then closes it", async () => {
    const onItemClick = vi.fn();
    const screen = await render(<Harness onItemClick={onItemClick} />);

    const caret = screen.getByRole("button", { name: "Toggle dropdown" });
    expect(expanded(caret.element())).toBe(false);

    await caret.click();
    await vi.waitFor(() => expect(expanded(caret.element())).toBe(true));

    await screen.getByText("Remove").click();
    await vi.waitFor(() =>
      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: "remove" }),
      ),
    );
    // autoClose defaults to true, so selecting an item closes the menu.
    await vi.waitFor(() => expect(expanded(caret.element())).toBe(false));
  });

  test("selecting an item updates the displayed main button label", async () => {
    const screen = await render(<Harness />);

    // The main button starts on the placeholder label.
    expect(screen.getByRole("button", { name: "Run" }).element()).toBeTruthy();

    const caret = screen.getByRole("button", { name: "Toggle dropdown" });
    await caret.click();
    await screen.getByText("Remove").click();

    // The main action button now reflects the chosen option. It is the only
    // <button> carrying that name — menu rows are <div>s.
    await vi.waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Remove" }).element(),
      ).toBeTruthy(),
    );
  });

  test("the main button fires onClick without opening the menu", async () => {
    const onClick = vi.fn();
    const onItemClick = vi.fn();
    const screen = await render(
      <Harness onClick={onClick} onItemClick={onItemClick} />,
    );

    await screen.getByRole("button", { name: "Run" }).click();
    expect(onClick).toHaveBeenCalledTimes(1);

    const caret = screen.getByRole("button", { name: "Toggle dropdown" });
    expect(expanded(caret.element())).toBe(false);
    expect(onItemClick).not.toHaveBeenCalled();
  });

  test("clicking outside closes the open menu", async () => {
    const screen = await render(<Harness />);

    const caret = screen.getByRole("button", { name: "Toggle dropdown" });
    await caret.click();
    await vi.waitFor(() => expect(expanded(caret.element())).toBe(true));

    await screen.getByText("outside").click();
    await vi.waitFor(() => expect(expanded(caret.element())).toBe(false));
  });
});
