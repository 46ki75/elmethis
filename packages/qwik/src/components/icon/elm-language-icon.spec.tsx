import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmLanguageIcon } from "./elm-language-icon";
import { mdiCodeTags } from "@mdi/js";

// Each language maps to a distinct brand SVG. We assert a marker that is unique
// to the expected sub-icon (a brand fill color, a gradient id) so a wrong
// mapping can't pass. The brand glyphs use viewBox "0 0 128 128"; the `file`
// fallback is an ElmMdiIcon with viewBox "0 0 24 24" + the mdiCodeTags path —
// a clean discriminator between "known language" and "fallback".

describe("[CSR] language → sub-icon mapping", () => {
  test("rust renders the Rust glyph (brand fill #a84f33)", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmLanguageIcon language="rust" />);
    expect(screen.outerHTML.toLowerCase()).toContain('fill="#a84f33"');
  });

  test("typescript renders the TypeScript glyph (brand fill #007acc)", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmLanguageIcon language="typescript" />);
    expect(screen.outerHTML.toLowerCase()).toContain('fill="#007acc"');
  });

  test("python renders the Python glyph (deviconPython gradient ids)", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmLanguageIcon language="python" />);
    expect(screen.outerHTML).toContain("deviconPython");
  });

  test("aliases normalize to the same glyph (rs → rust)", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmLanguageIcon language="rs" />);
    expect(screen.outerHTML.toLowerCase()).toContain('fill="#a84f33"');
  });

  test("unknown language falls back to the file icon (mdiCodeTags)", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmLanguageIcon language="totally-unknown-lang" />);
    const html = screen.outerHTML.toLowerCase();
    expect(html).toContain(`d="${mdiCodeTags.toLowerCase()}"`);
    // The MDI fallback uses the 24-grid viewBox, not the 128 brand grid.
    expect(html).toContain('viewbox="0 0 24 24"');
  });

  test("size prop reaches the rendered svg dimensions", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmLanguageIcon language="rust" size={48} />);
    const html = screen.outerHTML;
    expect(html).toContain('width="48"');
    expect(html).toContain('height="48"');
  });
});

describe("[SSR]", () => {
  // Nested component$ resolution requires the symbolMapper shim, mirroring the
  // ElmTabs SSR spec.
  const ssr = (node: Parameters<typeof renderToString>[0]) =>
    renderToString(node, {
      containerTagName: "div",
      symbolMapper: (symbolName, _mapper, parent) => [
        symbolName,
        parent ?? symbolName,
      ],
    });

  test("rust renders its brand glyph in the SSR shell", async () => {
    const renderResult = await ssr(<ElmLanguageIcon language="rust" />);
    expect(renderResult.html.toLowerCase()).toContain('fill="#a84f33"');
  });

  test("unknown language falls back to the file icon in SSR", async () => {
    const renderResult = await ssr(<ElmLanguageIcon language="nope" />);
    expect(renderResult.html.toLowerCase()).toContain(
      `d="${mdiCodeTags.toLowerCase()}"`,
    );
  });
});
