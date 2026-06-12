import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

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
  it("renders both the light and dark theme panels", () => {
    const { container } = render(<ElmColorSemanticSample />);
    expect(container.querySelector('[data-theme="light"]')).not.toBeNull();
    expect(container.querySelector('[data-theme="dark"]')).not.toBeNull();
  });

  it("stamps representative semantic tokens as copy targets", () => {
    const { container } = render(<ElmColorSemanticSample />);
    expect(
      container.querySelector(
        '[data-copy-token="--elmethis-color-surface-base"]',
      ),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-copy-token="--elmethis-color-primary"]'),
    ).not.toBeNull();
    // Section titles for the grouped roles.
    expect(container.innerHTML).toContain("Surface");
    expect(container.innerHTML).toContain("Accent");
  });

  it("forwards a custom className onto the root", () => {
    const { container } = render(
      <ElmColorSemanticSample className="custom-root" />,
    );
    expect(container.firstElementChild).toHaveClass("custom-root");
  });
});

// ---------------------------------------------------------------------------
// [SSR] — both theme panels must be in the server shell; the dark panel is the
// one most likely to be dropped if the duplicated render tree regressed.
// ---------------------------------------------------------------------------
describe("[SSR] ElmColorSemanticSample", () => {
  it("server HTML includes both theme panels", () => {
    const html = renderToStaticMarkup(<ElmColorSemanticSample />);
    expect(html).toContain('data-theme="light"');
    expect(html).toContain('data-theme="dark"');
  });
});
