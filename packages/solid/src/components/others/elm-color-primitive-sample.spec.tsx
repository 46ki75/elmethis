import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ElmColorPrimitiveSample } from "./elm-color-primitive-sample";

const mockClipboard = () => {
  const writeText = vi
    .fn<(text: string) => Promise<void>>()
    .mockResolvedValue();
  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  return writeText;
};

afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(window.navigator, "clipboard");
});

describe("[CSR] ElmColorPrimitiveSample", () => {
  it("renders representative primitive swatches and the default copy mode", () => {
    const { container, getByRole } = render(() => <ElmColorPrimitiveSample />);

    expect(
      container.querySelector(
        '[data-copy-token="--elmethis-primitive-color-red-500"]',
      ),
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        '[data-copy-token="--elmethis-primitive-color-slate-700"]',
      ),
    ).toBeInTheDocument();
    expect(getByRole("button")).toHaveTextContent("Copy: variable name");
  });

  it("forwards a ref and native props while reactively merging class and style", () => {
    const [decorated, setDecorated] = createSignal(false);
    const onClick = vi.fn();
    let root: HTMLDivElement | undefined;
    const { getByTestId } = render(() => (
      <ElmColorPrimitiveSample
        ref={(element) => {
          root = element;
        }}
        data-testid="sample"
        aria-label="Primitive colors"
        class={decorated() ? "after" : "before"}
        style={{ width: decorated() ? "20rem" : "10rem" }}
        onClick={onClick}
      />
    ));
    const sample = getByTestId("sample");

    expect(sample).toBe(root);
    expect(sample).toHaveClass("before");
    expect(sample.style.width).toBe("10rem");
    expect(sample).toHaveAttribute("aria-label", "Primitive colors");

    fireEvent.click(sample);
    expect(onClick).toHaveBeenCalledOnce();

    setDecorated(true);
    expect(sample).toHaveClass("after");
    expect(sample).not.toHaveClass("before");
    expect(sample.style.width).toBe("20rem");
  });

  it("copies variable names and replaces the active feedback timer", async () => {
    vi.useFakeTimers();
    const writeText = mockClipboard();
    const { container } = render(() => <ElmColorPrimitiveSample />);
    const red = container.querySelector<HTMLElement>(
      '[data-copy-token="--elmethis-primitive-color-red-500"]',
    )!;
    const blue = container.querySelector<HTMLElement>(
      '[data-copy-token="--elmethis-primitive-color-blue-500"]',
    )!;

    fireEvent.click(red);
    await Promise.resolve();
    expect(writeText).toHaveBeenLastCalledWith(
      "--elmethis-primitive-color-red-500",
    );
    expect(red).toHaveTextContent("copied!");

    vi.advanceTimersByTime(1000);
    fireEvent.click(blue);
    await Promise.resolve();
    vi.advanceTimersByTime(500);

    expect(blue).toHaveTextContent("copied!");
    expect(red).not.toHaveTextContent("copied!");

    vi.advanceTimersByTime(999);
    expect(blue).toHaveTextContent("copied!");
    vi.advanceTimersByTime(1);
    expect(blue).not.toHaveTextContent("copied!");
  });

  it("clears a pending feedback timer when disposed", async () => {
    vi.useFakeTimers();
    mockClipboard();
    const rendered = render(() => <ElmColorPrimitiveSample />);
    const swatch =
      rendered.container.querySelector<HTMLElement>("[data-copy-token]")!;

    fireEvent.click(swatch);
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(1);

    rendered.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
