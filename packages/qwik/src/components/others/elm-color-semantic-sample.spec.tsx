import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmColorSemanticSample } from "./elm-color-semantic-sample";

// ---------------------------------------------------------------------------
// [CSR]
//
// The semantic sample renders the same token set twice — once per forced
// theme panel (light + dark) — so every `data-theme`/`color-scheme` pair
// resolves its own `light-dark()` values. We smoke-render and assert both
// panels mount and representative semantic tokens are present as copy targets.
// Hex resolution depends on real computed styles, so it stays at the browser
// layer.
// ---------------------------------------------------------------------------
describe("[CSR] ElmColorSemanticSample", () => {
  test("renders both the light and dark theme panels", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmColorSemanticSample />);
    expect(screen.outerHTML).toContain('data-theme="light"');
    expect(screen.outerHTML).toContain('data-theme="dark"');
  });

  test("stamps representative semantic tokens as copy targets", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmColorSemanticSample />);
    expect(screen.outerHTML).toContain(
      'data-copy-token="--elmethis-color-surface-base"',
    );
    expect(screen.outerHTML).toContain(
      'data-copy-token="--elmethis-color-primary"',
    );
    // Section titles for the grouped roles.
    expect(screen.outerHTML).toContain("Surface");
    expect(screen.outerHTML).toContain("Accent");
  });

  test("forwards a custom class onto the root", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmColorSemanticSample class="custom-root" />);
    expect(screen.outerHTML).toContain("custom-root");
  });
});

// ---------------------------------------------------------------------------
// [SSR] — both theme panels must be in the server shell; the dark panel is the
// one most likely to be dropped if the duplicated <Render> tree regressed.
// ---------------------------------------------------------------------------
describe("[SSR] ElmColorSemanticSample", () => {
  test("server HTML includes both theme panels", async () => {
    const { html } = await renderToString(<ElmColorSemanticSample />, {
      containerTagName: "div",
    });
    expect(html).toContain('data-theme="light"');
    expect(html).toContain('data-theme="dark"');
  });
});
