import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ElmSelect, type ElmSelectOption } from "./elm-select";
import styles from "./elm-select.module.css";

const OPTIONS: ElmSelectOption[] = [
  { id: "a", label: "Apple" },
  { id: "b", label: "Banana" },
];

describe("[CSR] ElmSelect", () => {
  afterEach(() => vi.restoreAllMocks());

  it("forwards native props and a ref without leaking semantic props", () => {
    let root: HTMLDivElement | undefined;
    const rendered = render(() => (
      <ElmSelect
        ref={(element) => {
          root = element;
        }}
        label="Fruit"
        options={OPTIONS}
        class="custom-select"
        style={{ width: "12rem" }}
        data-testid="select"
        aria-label="Fruit selector"
        disabled
      />
    ));
    const select = rendered.getByTestId("select");

    expect(select).toBe(root);
    expect(select).toHaveClass("custom-select", styles.disabled);
    expect(select.style.width).toBe("12rem");
    expect(select).toHaveAttribute("aria-label", "Fruit selector");
    expect(select).not.toHaveAttribute("label");
    expect(select).not.toHaveAttribute("options");
    expect(select).not.toHaveAttribute("disabled");
  });

  it("selects an uncontrolled keyed option, reports it, and closes", () => {
    const onChange = vi.fn();
    const rendered = render(() => (
      <ElmSelect
        data-testid="select"
        label="Fruit"
        options={OPTIONS}
        onSelectedOptionIdChange={onChange}
      />
    ));
    const select = rendered.getByTestId("select");

    fireEvent.click(select);
    expect(select).toHaveClass(styles.active);
    fireEvent.click(rendered.getByText("Banana"));

    expect(onChange).toHaveBeenCalledWith("b");
    expect(select).not.toHaveClass(styles.active);
    expect(
      select.querySelector(`.${styles["selected-option"]}`),
    ).toHaveTextContent("Banana");
  });

  it("treats null as controlled and follows parent updates", () => {
    const [selected, setSelected] = createSignal<string | null>(null);
    const rendered = render(() => (
      <ElmSelect
        label="Fruit"
        placeholder="Choose"
        options={OPTIONS}
        selectedOptionId={selected()}
        defaultSelectedOptionId="a"
        onSelectedOptionIdChange={setSelected}
      />
    ));

    expect(rendered.getByText("Choose")).toBeInTheDocument();
    fireEvent.click(rendered.getByText("Fruit"));
    fireEvent.click(rendered.getByText("Apple"));
    expect(rendered.getAllByText("Apple")).toHaveLength(2);

    setSelected(null);
    expect(rendered.getByText("Choose")).toBeInTheDocument();
  });

  it("composes the root click and allows preventDefault to cancel opening", () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const rendered = render(() => (
      <ElmSelect
        data-testid="select"
        label="Fruit"
        options={OPTIONS}
        onClick={onClick}
      />
    ));
    const select = rendered.getByTestId("select");

    fireEvent.click(select);
    expect(onClick).toHaveBeenCalledOnce();
    expect(select).not.toHaveClass(styles.active);
  });

  it("reactively respects disabled and loading state", () => {
    const [disabled, setDisabled] = createSignal(true);
    const [loading, setLoading] = createSignal(false);
    const rendered = render(() => (
      <ElmSelect
        data-testid="select"
        label="Fruit"
        options={OPTIONS}
        disabled={disabled()}
        isLoading={loading()}
      />
    ));
    const select = rendered.getByTestId("select");

    fireEvent.click(select);
    expect(select).not.toHaveClass(styles.active);

    setDisabled(false);
    setLoading(true);
    fireEvent.click(select);
    expect(select).not.toHaveClass(styles.active);

    setLoading(false);
    fireEvent.click(select);
    expect(select).toHaveClass(styles.active);
  });

  it("closes outside and removes its document listener on cleanup", () => {
    const removeEventListener = vi.spyOn(document, "removeEventListener");
    const rendered = render(() => (
      <div>
        <button data-testid="outside">Outside</button>
        <ElmSelect data-testid="select" label="Fruit" options={OPTIONS} />
      </div>
    ));
    const select = rendered.getByTestId("select");

    fireEvent.click(select);
    fireEvent.click(rendered.getByTestId("outside"));
    expect(select).not.toHaveClass(styles.active);

    rendered.unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
  });
});
