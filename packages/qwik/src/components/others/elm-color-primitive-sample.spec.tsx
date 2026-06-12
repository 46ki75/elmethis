import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

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
  test("renders swatches stamped with their primitive token names", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmColorPrimitiveSample />);

    // A chromatic hue (sparse 100/500/900 scale) and a neutral (full scale).
    expect(screen.outerHTML).toContain(
      'data-copy-token="--elmethis-primitive-color-red-500"',
    );
    expect(screen.outerHTML).toContain(
      'data-copy-token="--elmethis-primitive-color-slate-700"',
    );
    // Section title for the hue group.
    expect(screen.outerHTML).toContain("red");
  });

  test("defaults the copy-mode toggle to variable-name mode", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmColorPrimitiveSample />);
    expect(screen.outerHTML).toContain("variable name");
  });

  test("forwards a custom class onto the root", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmColorPrimitiveSample class="custom-root" />);
    expect(screen.outerHTML).toContain("custom-root");
  });
});

// ---------------------------------------------------------------------------
// [SSR] — the server shell must contain the swatch tokens so a resumed client
// can wire up the delegated click handler against the already-present markup.
// ---------------------------------------------------------------------------
describe("[SSR] ElmColorPrimitiveSample", () => {
  test("server HTML includes the primitive swatch tokens", async () => {
    const { html } = await renderToString(<ElmColorPrimitiveSample />, {
      containerTagName: "div",
    });
    expect(html).toContain("--elmethis-primitive-color-blue-500");
  });
});
