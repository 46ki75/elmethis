import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmColorPrimitiveSample } from "./elm-color-primitive-sample";

// ---------------------------------------------------------------------------
// [CSR]
//
// Smoke-level coverage: the sample renders a swatch grid of `--elmethis-
// primitive-color-*` tokens plus a copy-mode toggle. We assert representative
// swatches are stamped with their `data-copy-token` (the delegated click
// handler keys off this attribute) and that the toggle reflects the default
// "variable name" mode. Clipboard / hex-resolution behavior needs real
// `navigator.clipboard` + computed styles, so it's left to browser coverage.
// ---------------------------------------------------------------------------
describe("[CSR] ElmColorPrimitiveSample", () => {
  it("renders swatches stamped with their primitive token names", () => {
    const { container } = render(<ElmColorPrimitiveSample />);

    // A chromatic hue (sparse 100/500/900 scale) and a neutral (full scale).
    expect(
      container.querySelector(
        '[data-copy-token="--elmethis-primitive-color-red-500"]',
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        '[data-copy-token="--elmethis-primitive-color-slate-700"]',
      ),
    ).not.toBeNull();
    // Section title for the hue group.
    expect(container.textContent).toContain("red");
  });

  it("defaults the copy-mode toggle to variable-name mode", () => {
    const { container } = render(<ElmColorPrimitiveSample />);
    expect(container.textContent).toContain("variable name");
  });

  it("forwards a custom class onto the root", () => {
    const { container } = render(
      <ElmColorPrimitiveSample className="custom-root" />,
    );
    expect(container.firstElementChild).toHaveClass("custom-root");
  });
});

// ---------------------------------------------------------------------------
// [SSR] — the server shell must contain the swatch tokens so a resumed client
// can wire up the delegated click handler against the already-present markup.
// ---------------------------------------------------------------------------
describe("[SSR] ElmColorPrimitiveSample", () => {
  it("server HTML includes the primitive swatch tokens", () => {
    const html = renderToStaticMarkup(<ElmColorPrimitiveSample />);
    expect(html).toContain("--elmethis-primitive-color-blue-500");
  });
});
