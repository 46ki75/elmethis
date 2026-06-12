import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmButton } from "./elm-button";

describe("[CSR] ElmButton — rendering & variants", () => {
  it("renders children inside a <button>", () => {
    const { container } = render(<ElmButton>Click me</ElmButton>);
    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(button).toHaveTextContent("Click me");
  });

  it("primary applies the primary variant class", () => {
    const { container } = render(<ElmButton primary>Primary</ElmButton>);
    expect(container.querySelector("button")?.className).toMatch(/primary/);
  });

  it("default (no primary, no color) applies the normal variant class", () => {
    const { container } = render(<ElmButton>Normal</ElmButton>);
    expect(container.querySelector("button")?.className).toMatch(/normal/);
  });

  it("isLoading renders the loading icon instead of children", () => {
    const { container } = render(<ElmButton isLoading>Hidden</ElmButton>);
    expect(
      container.querySelector('[class*="elm-dot-loading-icon"]'),
    ).not.toBeNull();
    expect(container.textContent).not.toContain("Hidden");
  });

  it("disabled forwards the native attribute onto the <button>", () => {
    const { container } = render(<ElmButton disabled>Nope</ElmButton>);
    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("color flows into the scoped CSS custom property", () => {
    const { container } = render(<ElmButton color="red">x</ElmButton>);
    const button = container.querySelector("button")!;
    expect(button.style.getPropertyValue("--elmethis-scoped-color")).toBe(
      "red",
    );
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmButton className="custom-class">x</ElmButton>,
    );
    expect(container.querySelector("button")).toHaveClass("custom-class");
  });
});

describe("[CSR] ElmButton — onClick", () => {
  it("fires onClick when enabled", () => {
    const onClick = vi.fn();
    const { container } = render(<ElmButton onClick={onClick}>Go</ElmButton>);
    fireEvent.click(container.querySelector("button")!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    const { container } = render(
      <ElmButton disabled onClick={onClick}>
        Go
      </ElmButton>,
    );
    fireEvent.click(container.querySelector("button")!);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not fire onClick when isLoading", () => {
    const onClick = vi.fn();
    const { container } = render(
      <ElmButton isLoading onClick={onClick}>
        Go
      </ElmButton>,
    );
    fireEvent.click(container.querySelector("button")!);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("[SSR] ElmButton", () => {
  it("renders children in the server shell", () => {
    const html = renderToStaticMarkup(
      <ElmButton primary>Submit</ElmButton>,
    ).toLowerCase();
    expect(html).toContain("<button");
    expect(html).toContain("submit");
  });
});
