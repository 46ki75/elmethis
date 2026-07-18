import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import styles from "./elm-toggle.module.css";
import { ElmToggle } from "./elm-toggle";

describe("[CSR] ElmToggle", () => {
  it("renders string and custom summary content", () => {
    const { getByText, unmount } = render(() => (
      <ElmToggle summary="Summary text">
        <span>Body content</span>
      </ElmToggle>
    ));

    expect(getByText("Summary text")).toBeInTheDocument();
    expect(getByText("Body content")).toBeInTheDocument();
    unmount();

    const custom = render(() => (
      <ElmToggle summary={<strong>Custom summary</strong>}>Content</ElmToggle>
    ));
    expect(custom.getByText("Custom summary").tagName).toBe("STRONG");
  });

  it("forwards native props, styles, handlers, and a ref without leaking semantic props", () => {
    let root: HTMLDivElement | undefined;
    const onClick = vi.fn();
    const { getByTestId } = render(() => (
      <ElmToggle
        ref={(element) => {
          root = element;
        }}
        data-testid="toggle"
        aria-label="Details"
        class="custom-toggle"
        style={{ margin: "1rem" }}
        summary="Summary"
        defaultIsOpen
        monochrome
        onClick={onClick}
      >
        Content
      </ElmToggle>
    ));
    const toggle = getByTestId("toggle");

    expect(toggle).toBe(root);
    expect(toggle).toHaveClass("custom-toggle", styles.open);
    expect(toggle.style.margin).toBe("1rem");
    expect(toggle).toHaveAttribute("aria-label", "Details");
    expect(toggle).not.toHaveAttribute("summary");
    expect(toggle).not.toHaveAttribute("defaultIsOpen");
    expect(toggle).not.toHaveAttribute("monochrome");

    fireEvent.click(toggle.querySelector(`.${styles.summary}`)!);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("treats false as controlled and calls back before the native root click", () => {
    const calls: string[] = [];
    const onOpenChange = vi.fn(() => calls.push("change"));
    const { getByTestId } = render(() => (
      <ElmToggle
        data-testid="toggle"
        summary="Summary"
        isOpen={false}
        onOpenChange={onOpenChange}
        onClick={() => calls.push("click")}
      >
        Content
      </ElmToggle>
    ));
    const toggle = getByTestId("toggle");

    fireEvent.click(toggle.querySelector(`.${styles.summary}`)!);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(calls).toEqual(["change", "click"]);
    expect(toggle).not.toHaveClass(styles.open);
  });

  it("toggles uncontrolled state and reports each next value synchronously", () => {
    const values: boolean[] = [];
    const { getByTestId } = render(() => (
      <ElmToggle
        data-testid="toggle"
        summary="Summary"
        onOpenChange={(value) => values.push(value)}
      >
        Content
      </ElmToggle>
    ));
    const toggle = getByTestId("toggle");
    const summary = toggle.querySelector(`.${styles.summary}`)!;

    fireEvent.click(summary);
    expect(toggle).toHaveClass(styles.open);
    fireEvent.click(summary);

    expect(toggle).not.toHaveClass(styles.open);
    expect(values).toEqual([true, false]);
  });

  it("reactively reflects controlled state, class, summary, and monochrome color", () => {
    const [isOpen, setIsOpen] = createSignal(false);
    const [monochrome, setMonochrome] = createSignal(false);
    const { getByTestId } = render(() => (
      <ElmToggle
        data-testid="toggle"
        class={isOpen() ? "open-toggle" : "closed-toggle"}
        summary={isOpen() ? "Open summary" : "Closed summary"}
        isOpen={isOpen()}
        monochrome={monochrome()}
      >
        Content
      </ElmToggle>
    ));
    const toggle = getByTestId("toggle");

    expect(toggle).toHaveClass("closed-toggle");
    expect(toggle).toHaveTextContent("Closed summary");

    setIsOpen(true);
    setMonochrome(true);

    expect(toggle).toHaveClass("open-toggle", styles.open);
    expect(toggle).not.toHaveClass("closed-toggle");
    expect(toggle).toHaveTextContent("Open summary");
    for (const icon of toggle.querySelectorAll("svg")) {
      expect(icon).toHaveAttribute(
        "fill",
        "var(--elmethis-color-neutral-weak)",
      );
    }
  });
});
