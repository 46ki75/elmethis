import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmColorSemanticSample } from "./elm-color-semantic-sample";

describe("[CSR] ElmColorSemanticSample", () => {
  it("renders both themes and representative semantic copy targets", () => {
    const { container, getByRole } = render(() => <ElmColorSemanticSample />);

    expect(container.querySelector('[data-theme="light"]')).toBeInTheDocument();
    expect(container.querySelector('[data-theme="dark"]')).toBeInTheDocument();
    expect(
      container.querySelector(
        '[data-copy-token="--elmethis-color-surface-base"]',
      ),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-copy-token="--elmethis-color-primary"]'),
    ).toBeInTheDocument();
    expect(getByRole("button")).toHaveTextContent("Copy: variable name");
  });

  it("forwards refs and native props with reactive class and style", () => {
    const [decorated, setDecorated] = createSignal(false);
    const onClick = vi.fn();
    let root: HTMLDivElement | undefined;
    const { getByTestId } = render(() => (
      <ElmColorSemanticSample
        ref={(element) => {
          root = element;
        }}
        data-testid="sample"
        class={decorated() ? "after" : "before"}
        style={{ width: decorated() ? "30rem" : "15rem" }}
        onClick={onClick}
      />
    ));
    const sample = getByTestId("sample");

    expect(sample).toBe(root);
    expect(sample).toHaveClass("before");
    expect(sample.style.width).toBe("15rem");

    fireEvent.click(sample);
    expect(onClick).toHaveBeenCalledOnce();

    setDecorated(true);
    expect(sample).toHaveClass("after");
    expect(sample).not.toHaveClass("before");
    expect(sample.style.width).toBe("30rem");
  });

  it("reactively toggles the copy mode", () => {
    const { getByRole } = render(() => <ElmColorSemanticSample />);
    const toggle = getByRole("button");

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent("Copy: hex value");
    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent("Copy: variable name");
  });
});
