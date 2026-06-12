import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmLanguageIcon } from "./elm-language-icon";
import { mdiCodeTags } from "@mdi/js";

// Each language maps to a distinct brand SVG. We assert a marker that is unique
// to the expected sub-icon (a brand fill color, a gradient id) so a wrong
// mapping can't pass. The brand glyphs use viewBox "0 0 128 128"; the `file`
// fallback is an ElmMdiIcon with viewBox "0 0 24 24" + the mdiCodeTags path —
// a clean discriminator between "known language" and "fallback".

describe("[CSR] language → sub-icon mapping", () => {
  it("rust renders the Rust glyph (brand fill #a84f33)", () => {
    const { container } = render(<ElmLanguageIcon language="rust" />);
    expect(container.innerHTML.toLowerCase()).toContain('fill="#a84f33"');
  });

  it("typescript renders the TypeScript glyph (brand fill #007acc)", () => {
    const { container } = render(<ElmLanguageIcon language="typescript" />);
    expect(container.innerHTML.toLowerCase()).toContain('fill="#007acc"');
  });

  it("python renders the Python glyph (deviconPython gradient ids)", () => {
    const { container } = render(<ElmLanguageIcon language="python" />);
    expect(container.innerHTML).toContain("deviconPython");
  });

  it("aliases normalize to the same glyph (rs → rust)", () => {
    const { container } = render(<ElmLanguageIcon language="rs" />);
    expect(container.innerHTML.toLowerCase()).toContain('fill="#a84f33"');
  });

  it("unknown language falls back to the file icon (mdiCodeTags)", () => {
    const { container } = render(
      <ElmLanguageIcon language="totally-unknown-lang" />,
    );
    const html = container.innerHTML.toLowerCase();
    expect(html).toContain(`d="${mdiCodeTags.toLowerCase()}"`);
    // The MDI fallback uses the 24-grid viewBox, not the 128 brand grid.
    expect(html).toContain('viewbox="0 0 24 24"');
  });

  it("size prop reaches the rendered svg dimensions", () => {
    const { container } = render(<ElmLanguageIcon language="rust" size={48} />);
    const html = container.innerHTML;
    expect(html).toContain('width="48"');
    expect(html).toContain('height="48"');
  });
});

describe("[SSR] ElmLanguageIcon", () => {
  it("rust renders its brand glyph in the SSR shell", () => {
    const html = renderToStaticMarkup(
      <ElmLanguageIcon language="rust" />,
    ).toLowerCase();
    expect(html).toContain('fill="#a84f33"');
  });

  it("unknown language falls back to the file icon in SSR", () => {
    const html = renderToStaticMarkup(
      <ElmLanguageIcon language="nope" />,
    ).toLowerCase();
    expect(html).toContain(`d="${mdiCodeTags.toLowerCase()}"`);
  });
});
