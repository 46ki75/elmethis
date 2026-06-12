import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmTextField } from "./elm-text-field";

describe("[CSR] ElmTextField — rendering", () => {
  it("renders the label", () => {
    const { container } = render(<ElmTextField label="Username" />);
    expect(container.textContent).toContain("Username");
  });

  it("placeholder is forwarded onto the input", () => {
    const { container } = render(
      <ElmTextField label="Email" placeholder="you@example.com" />,
    );
    const input = container.querySelector("input")!;
    expect(input.placeholder).toBe("you@example.com");
  });

  it("a value renders as the input value", () => {
    const { container } = render(
      <ElmTextField label="Name" value="seed" onChange={() => {}} />,
    );
    const input = container.querySelector("input")!;
    expect(input.value).toBe("seed");
  });

  it("disabled forwards onto the input and applies the disabled class", () => {
    const { container } = render(<ElmTextField label="Locked" disabled />);
    const input = container.querySelector("input")!;
    expect(input.disabled).toBe(true);
    expect(container.outerHTML).toMatch(/disabled/);
  });

  it("required renders the marker and sets aria-required", () => {
    const { container } = render(<ElmTextField label="Mandatory" required />);
    const input = container.querySelector("input")!;
    expect(input.getAttribute("aria-required")).toBe("true");
    expect(container.textContent).toContain("*");
  });

  it("isPassword renders the input with type=password", () => {
    const { container } = render(<ElmTextField label="Secret" isPassword />);
    const input = container.querySelector("input")!;
    expect(input.type).toBe("password");
  });

  it("renders a leading icon by default when no icon slot is provided", () => {
    const { container } = render(<ElmTextField label="Text" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders a custom icon when the icon prop is provided", () => {
    const { container } = render(
      <ElmTextField label="Text" icon={<span data-testid="custom-icon" />} />,
    );
    expect(
      container.querySelector('[data-testid="custom-icon"]'),
    ).not.toBeNull();
  });
});

describe("[CSR] ElmTextField — value binding", () => {
  it("typing into the input calls onChange with the new value", () => {
    // Capture synchronously inside the handler: with a fixed controlled
    // `value=""`, React resets the input's value after the change event, so
    // reading `event.target.value` after the fact would observe the reset "".
    let captured: string | undefined;
    const onChange = vi.fn((event) => {
      captured = event.target.value;
    });
    const { container } = render(
      <ElmTextField label="Name" value="" onChange={onChange} />,
    );
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "Ada" } });
    expect(onChange).toHaveBeenCalled();
    expect(captured).toBe("Ada");
  });

  it("typing updates a controlled parent value", () => {
    const Harness = () => {
      const [value, setValue] = useState("");
      return (
        <div>
          <output data-testid="value">{value}</output>
          <ElmTextField
            label="Name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      );
    };
    const { container } = render(<Harness />);
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "Ada" } });
    expect(container.querySelector('[data-testid="value"]')?.textContent).toBe(
      "Ada",
    );
  });

  it("renders a character counter when value is set (with maxLength)", () => {
    const { container } = render(
      <ElmTextField
        label="Counted"
        value="abc"
        maxLength={10}
        onChange={() => {}}
      />,
    );
    expect(container.textContent).toContain("3 / 10");
  });

  it("does not render a character counter when value is omitted", () => {
    const { container } = render(<ElmTextField label="None" maxLength={10} />);
    expect(container.textContent).not.toContain("/ 10");
  });
});

describe("[SSR] ElmTextField", () => {
  it("renders the label and an input in the server shell", () => {
    const html = renderToStaticMarkup(
      <ElmTextField label="SSR" />,
    ).toLowerCase();
    expect(html).toContain("ssr");
    expect(html).toContain("<input");
  });
});
