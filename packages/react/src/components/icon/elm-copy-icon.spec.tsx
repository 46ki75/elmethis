import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmCopyIcon } from "./elm-copy-icon";
import { mdiClipboardOutline } from "@mdi/js";

// ElmCopyIcon is a thin wrapper around useClipboard's CopyButton — clipboard
// behavior is covered by use-clipboard.spec. Here we only smoke-render and
// assert the copy affordance (the clipboard glyph) shows up.

describe("[CSR] ElmCopyIcon", () => {
  it("renders the clipboard copy affordance", () => {
    const { container } = render(<ElmCopyIcon content="hello" />);
    const html = container.innerHTML.toLowerCase();
    expect(html).toContain("<svg");
    // The idle state shows the clipboard-outline glyph.
    expect(html).toContain(`d="${mdiClipboardOutline.toLowerCase()}"`);
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmCopyIcon className="custom-class" content="hello" />,
    );
    expect(container.querySelector(".custom-class")).not.toBeNull();
  });
});

describe("[SSR] ElmCopyIcon", () => {
  it("renders the clipboard glyph server-side", () => {
    const html = renderToStaticMarkup(
      <ElmCopyIcon content="hello" />,
    ).toLowerCase();
    expect(html).toContain("<svg");
    expect(html).toContain(`d="${mdiClipboardOutline.toLowerCase()}"`);
  });
});
