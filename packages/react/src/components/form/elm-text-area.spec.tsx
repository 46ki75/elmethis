import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmTextArea } from "./elm-text-area";

describe("[CSR] ElmTextArea — rendering", () => {
  it("renders the label", () => {
    const { container } = render(<ElmTextArea label="Bio" />);
    expect(container.textContent).toContain("Bio");
  });

  it("placeholder is forwarded onto the textarea", () => {
    const { container } = render(
      <ElmTextArea label="Notes" placeholder="Type here" />,
    );
    const ta = container.querySelector("textarea")!;
    expect(ta.placeholder).toBe("Type here");
  });

  it("rows defaults to 3 and honors the prop", () => {
    const { container, rerender } = render(<ElmTextArea label="Sized" />);
    expect(container.querySelector("textarea")!.getAttribute("rows")).toBe("3");
    rerender(<ElmTextArea label="Sized" rows={6} />);
    expect(container.querySelector("textarea")!.getAttribute("rows")).toBe("6");
  });

  it("a controlled value renders as the textarea value", () => {
    const { container } = render(
      <ElmTextArea label="Body" value="seed text" onChange={() => {}} />,
    );
    expect(container.querySelector("textarea")!.value).toBe("seed text");
  });

  it("disabled forwards onto the textarea and applies the disabled class", () => {
    const { container } = render(<ElmTextArea label="Locked" disabled />);
    const ta = container.querySelector("textarea")!;
    expect(ta.disabled).toBe(true);
    const label = container.querySelector("label")!;
    expect(label.className).toMatch(/disabled/);
  });

  it("isLoading disables the textarea", () => {
    const { container } = render(<ElmTextArea label="Busy" isLoading />);
    expect(container.querySelector("textarea")!.disabled).toBe(true);
  });

  it("required sets aria-required and renders the marker", () => {
    const { container } = render(<ElmTextArea label="Mandatory" required />);
    const ta = container.querySelector("textarea")!;
    expect(ta.getAttribute("aria-required")).toBe("true");
    expect(container.textContent).toContain("*");
  });

  it("renders a custom icon when provided instead of the default", () => {
    const { getByTestId } = render(
      <ElmTextArea label="Iconed" icon={<span data-testid="custom-icon" />} />,
    );
    expect(getByTestId("custom-icon")).toBeTruthy();
  });
});

describe("[CSR] ElmTextArea — value & counter", () => {
  it("calls onInput when the user types", () => {
    const onInput = vi.fn();
    const { container } = render(
      <ElmTextArea label="Body" defaultValue="" onInput={onInput} />,
    );
    const ta = container.querySelector("textarea")!;
    fireEvent.input(ta, { target: { value: "hello" } });
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("renders a character counter (with maxLength) for a controlled value", () => {
    const { container } = render(
      <ElmTextArea
        label="Counted"
        value="abcd"
        maxLength={20}
        onChange={() => {}}
      />,
    );
    expect(container.textContent).toContain("4 / 20");
  });

  it("counter tracks typed input for an uncontrolled value", () => {
    const { container } = render(
      <ElmTextArea label="Counted" defaultValue="" maxLength={20} />,
    );
    expect(container.textContent).toContain("0 / 20");
    const ta = container.querySelector("textarea")!;
    fireEvent.input(ta, { target: { value: "hello" } });
    expect(container.textContent).toContain("5 / 20");
  });

  it("omits the counter when neither value nor defaultValue is provided", () => {
    const { container } = render(<ElmTextArea label="Plain" maxLength={10} />);
    expect(container.textContent).not.toContain("/ 10");
  });
});

describe("[SSR] ElmTextArea", () => {
  it("renders the label and a textarea server-side", () => {
    const html = renderToStaticMarkup(
      <ElmTextArea label="SSR" />,
    ).toLowerCase();
    expect(html).toContain("ssr");
    expect(html).toContain("<textarea");
  });
});
