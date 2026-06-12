import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmToggle } from "./elm-toggle";

// Click-driven toggling lives in elm-toggle.browser.spec.tsx. The unit layer
// covers render, summary slot, SSR, and the statically-derived `open` modifier
// for the uncontrolled defaultIsOpen path.

describe("[CSR] ElmToggle", () => {
  it("renders the string summary and slot content", () => {
    const { container } = render(
      <ElmToggle summary="Summary text">
        <span>Body content</span>
      </ElmToggle>,
    );
    expect(container.textContent).toContain("Summary text");
    expect(container.textContent).toContain("Body content");
  });

  // A non-string `summary` (qwik's named `summary` slot) renders as-is.
  it("renders a custom summary node when summary is not a string", () => {
    const { container } = render(
      <ElmToggle summary={<span>Slotted summary</span>}>
        <span>Content</span>
      </ElmToggle>,
    );
    expect(container.textContent).toContain("Slotted summary");
  });

  // Uncontrolled: the internal state seeds from `defaultIsOpen`, so the root
  // carries the `open` modifier at first render.
  it("carries the open modifier when defaultIsOpen is true", () => {
    const { container } = render(
      <ElmToggle summary="S" defaultIsOpen>
        <span>Content</span>
      </ElmToggle>,
    );
    const root = container.querySelector("[class*='elm-toggle']");
    expect(root?.className).toContain("open");
  });

  it("does not carry the open modifier when closed by default", () => {
    const { container } = render(
      <ElmToggle summary="S">
        <span>Content</span>
      </ElmToggle>,
    );
    const root = container.querySelector("[class*='elm-toggle']");
    expect(root?.className).not.toContain("open");
  });

  // Controlled: the root reflects the parent-owned `isOpen` value.
  it("reflects the controlled isOpen value", () => {
    const { container } = render(
      <ElmToggle summary="S" isOpen>
        <span>Content</span>
      </ElmToggle>,
    );
    const root = container.querySelector("[class*='elm-toggle']");
    expect(root?.className).toContain("open");
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmToggle summary="S" className="custom-class">
        <span>Content</span>
      </ElmToggle>,
    );
    const root = container.querySelector("[class*='elm-toggle']");
    expect(root).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmToggle", () => {
  it("renders summary and content on the server", () => {
    const html = renderToStaticMarkup(
      <ElmToggle summary="Summary text">
        <span>Body content</span>
      </ElmToggle>,
    );
    expect(html).toContain("Summary text");
    expect(html).toContain("Body content");
  });
});
