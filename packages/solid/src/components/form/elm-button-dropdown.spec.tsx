import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ElmButtonDropdown,
  type ElmButtonDropdownItem,
} from "./elm-button-dropdown";
import styles from "./elm-button-dropdown.module.css";

const ITEMS: ElmButtonDropdownItem[] = [
  { id: "edit", label: "Edit" },
  { id: "remove", label: "Remove" },
];

describe("[CSR] ElmButtonDropdown", () => {
  afterEach(() => vi.restoreAllMocks());

  it("forwards native root props and a ref without leaking semantic props", () => {
    let root: HTMLDivElement | undefined;
    const rendered = render(() => (
      <ElmButtonDropdown
        ref={(element) => {
          root = element;
        }}
        label="Run"
        items={ITEMS}
        class="custom-dropdown"
        style={{ width: "14rem" }}
        data-testid="dropdown"
        aria-label="Model actions"
        block
      />
    ));
    const dropdown = rendered.getByTestId("dropdown");

    expect(dropdown).toBe(root);
    expect(dropdown).toHaveClass("custom-dropdown", styles.block);
    expect(dropdown.style.width).toBe("14rem");
    expect(dropdown).toHaveAttribute("aria-label", "Model actions");
    expect(dropdown).not.toHaveAttribute("items");
    expect(dropdown).not.toHaveAttribute("block");
  });

  it("preserves selection, item, aggregate, and auto-close callback order", () => {
    const order: string[] = [];
    const items: ElmButtonDropdownItem[] = [
      {
        id: "edit",
        label: "Edit",
        onClick: () => order.push("item"),
      },
    ];
    const rendered = render(() => (
      <ElmButtonDropdown
        label="Run"
        items={items}
        onSelectedOptionIdChange={(id) => order.push(`selected:${id}`)}
        onItemClick={() => order.push("aggregate")}
        onOpenChange={(open) => order.push(`open:${open}`)}
      />
    ));
    const caret = rendered.getByRole("button", { name: "Toggle dropdown" });

    fireEvent.click(caret);
    expect(order).toEqual(["open:true"]);
    order.length = 0;
    fireEvent.click(rendered.getByText("Edit"));

    expect(order).toEqual(["selected:edit", "item", "aggregate", "open:false"]);
    expect(caret).toHaveAttribute("aria-expanded", "false");
    expect(rendered.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("treats null as controlled and reports the selected item to the main action", () => {
    const [selected, setSelected] = createSignal<string | null>(null);
    const onClick = vi.fn();
    const rendered = render(() => (
      <ElmButtonDropdown
        label="Run"
        items={ITEMS}
        selectedOptionId={selected()}
        defaultSelectedOptionId="edit"
        onSelectedOptionIdChange={setSelected}
        onClick={onClick}
      />
    ));

    fireEvent.click(rendered.getByRole("button", { name: "Run" }));
    expect(onClick).toHaveBeenLastCalledWith(null);

    fireEvent.click(rendered.getByRole("button", { name: "Toggle dropdown" }));
    fireEvent.click(rendered.getByText("Remove"));
    fireEvent.click(rendered.getByRole("button", { name: "Remove" }));
    expect(onClick).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "remove" }),
    );

    setSelected(null);
    expect(rendered.getByRole("button", { name: "Run" })).toBeInTheDocument();
  });

  it("keeps the menu open when autoClose is false and closes outside", () => {
    const onOpenChange = vi.fn();
    const rendered = render(() => (
      <div>
        <button data-testid="outside">Outside</button>
        <ElmButtonDropdown
          label="Run"
          items={ITEMS}
          autoClose={false}
          onOpenChange={onOpenChange}
        />
      </div>
    ));
    const caret = rendered.getByRole("button", { name: "Toggle dropdown" });

    fireEvent.click(caret);
    fireEvent.click(rendered.getByText("Edit"));
    expect(caret).toHaveAttribute("aria-expanded", "true");
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    fireEvent.click(rendered.getByTestId("outside"));
    expect(caret).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("ignores disabled items and independently disables both segments", () => {
    const onItemClick = vi.fn();
    const rendered = render(() => (
      <ElmButtonDropdown
        label="Run"
        items={[{ id: "remove", label: "Remove", disabled: true }]}
        disableMainButton
        onItemClick={onItemClick}
      />
    ));
    const buttons = rendered.getAllByRole("button");

    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).not.toBeDisabled();
    fireEvent.click(rendered.getByText("Remove"));
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it("removes the outside-click listener on cleanup", () => {
    const removeEventListener = vi.spyOn(document, "removeEventListener");
    const rendered = render(() => (
      <ElmButtonDropdown label="Run" items={ITEMS} />
    ));

    rendered.unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
  });
});
